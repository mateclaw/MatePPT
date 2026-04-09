// src/hooks/useFile.ts
import { useState, useCallback, useRef, useMemo } from 'react';
import { message, notification, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useThrottleFn } from 'ahooks';
import useUserStore from '@/stores/userStore';
import { config } from '@/config';
import { HttpClientService } from '@/services/httpClient.service';
import { lastValueFrom } from "rxjs";
import { set } from 'lodash';
import React from 'react';


type EventHook<T> = {
  on: (fn: (param: T) => void) => void;
  trigger: (param: T) => void;
};

const createEventHook = <T>(): EventHook<T> => {
  const listeners = new Set<(param: T) => void>();
  return {
    on: (fn) => { listeners.add(fn) },
    trigger: (param) => { listeners.forEach(fn => fn(param)) }
  };
};

export const useFile = () => {
  const { baseUrl } = config;
  const userStore = useUserStore();
  const [uploading, setUploading] = useState(false);
  const [showUploadMessage] = useState(true);
  const [uploadMaxSize, setUploadMaxSize] = useState(10 * 1024 * 1024);
  const [uploadTypes, setUploadTypes] = useState(".xls,.xlsx");
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  // 事件系统
  const fetchResult = useRef(createEventHook<any>());
  const fetchError = useRef(createEventHook<any>());

  // 通用下载逻辑
  const downloadCore = useCallback(async (
    method: 'get' | 'post',
    url: string,
    params: any,
    filename?: string
  ) => {
    try {

      const response = await axios[method](url, method === 'post' ? params : null, {
        responseType: 'blob',
        baseURL: baseUrl,
        headers: { 'User-Token': userStore.accessToken },
        params: method === 'get' ? params : undefined
      });

      const disposition = response.headers['content-disposition'];
      const fileName = disposition
        ? decodeURIComponent(disposition.split("filename=")[1])
        : filename || 'download';

      const blob = new Blob([response.data], {
        type: response.headers['content-type']
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      message.error('下载失败');
    }
  }, [baseUrl, userStore.accessToken]);

  // 暴露的下载方法
  const download = useCallback((url: string, params: Record<string, any>) => {
    const query = new URLSearchParams({
      ...params,
      // 'User-Token': userStore.accessToken
    }).toString();
    window.open(`${baseUrl}${url}${url.includes('?') ? '&' : '?'}${query}`);
  }, [baseUrl, userStore.accessToken]);

  const downloadFile = useCallback(
    (url: string, params: any, filename?: string) =>
      downloadCore('post', url, params, filename),
    [downloadCore]
  );

  const downloadFileGet = useCallback(
    (url: string, params: any, filename?: string) =>
      downloadCore('get', url, params, filename),
    [downloadCore]
  );
  const controllerRef = useRef<AbortController>();
  const notificationKey = useRef<string>();


  const getHeaders = useCallback(() => {
    const userInfo = userStore.userInfo;
    const headers = {
        'User-Token': userInfo.token,
    };
    return headers;
}, []);
  // const downloadFetch = useThrottleFn(
  //   async (option: {
  //     url: string,
  //     params?: RequestInit,
  //     filename?: string,
  //     canHideNotification?: boolean
  //   }) => {
  //     const { url, params, filename, canHideNotification } = option;
  //     controllerRef.current = new AbortController();
  //     notificationKey.current = `download-${Date.now()}`;

  //     try {
  //       const response = await fetch(url, {
  //         ...params,
  //         signal: controllerRef.current.signal,
  //         headers: {
  //           'User-Token': userStore.accessToken,
  //           ...params?.headers
  //         }
  //       });

  //       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  //       if (!response.body) throw new Error('No readable stream received');

  //       const total = Number(response.headers.get('content-length') || 0);
  //       const reader = response.body.getReader();
  //       const chunks: Uint8Array[] = [];
  //       let received = 0;

  //       // 显示进度通知
  //       setNotificationVisible(true);
  //       notification.info({
  //         key: notificationKey.current,
  //         duration: 0,
  //         message: '文件下载中',
  //         description: [
  //           `文件: ${filename || '未知文件'}`,
  //           `进度: ${progress}%`
  //         ].join('\n'),
  //         onClose: () => {
  //           if (canHideNotification) {
  //             Modal.confirm({
  //               title: '确认取消下载？',
  //               icon: React.createElement(ExclamationCircleOutlined),
  //               content: '如果取消，已下载部分将丢失',
  //               onOk: () => controllerRef.current?.abort(),
  //               onCancel: () => setNotificationVisible(true)
  //             });
  //           }
  //         }
  //       });

  //       // 读取数据流
  //       while (true) {
  //         const { done, value } = await reader.read();
  //         if (done) break;
  //         chunks.push(value);
  //         received += value.length;
  //         setProgress(total > 0 ? Math.round((received / total) * 100) : 0);
  //       }

  //       // 创建下载链接
  //       const blob = new Blob(chunks, {
  //         type: response.headers.get('content-type') || 'application/octet-stream'
  //       });
  //       const downloadUrl = URL.createObjectURL(blob);
  //       const link = document.createElement('a');
  //       link.href = downloadUrl;
  //       link.download = filename ||
  //         decodeURIComponent(
  //           response.headers.get('content-disposition')?.split('filename=')[1] || 'download'
  //         );
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);
  //       URL.revokeObjectURL(downloadUrl);

  //       // 更新通知为完成状态
  //       notification.success({
  //         key: notificationKey.current,
  //         message: '下载完成',
  //         description: `文件 ${link.download} 已保存`
  //       });

  //     } catch (error: any) {
  //       if (error.name === 'AbortError') {
  //         notification.warning({
  //           key: notificationKey.current,
  //           message: '下载已取消'
  //         });
  //       } else {
  //         notification.error({
  //           key: notificationKey.current,
  //           message: '下载失败',
  //           description: error.message
  //         });
  //       }
  //     } finally {
  //       setNotificationVisible(false);
  //       setProgress(0);
  //     }
  //   },
  //   { wait: 3000 }
  // );

  // 上传校验
  const checkBeforeUpload = useCallback((file: File) => {
    if (file.size > uploadMaxSize) {
      message.error(`文件大小不能超过 ${uploadMaxSize / 1024 / 1024}MB`);
      return false;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!uploadTypes.includes(`.${ext}`)) {
      message.error(`仅支持 ${uploadTypes} 格式`);
      return false;
    }
    return true;
  }, [uploadMaxSize, uploadTypes]);

  // 表单上传
  const handleUploadWithFormData = useCallback(async (
    option: {
      formRef: any,
      data: any,
      fileList: File[],
      url: string
    }
  ) => {
    if (option.fileList.length === 0) {
      message.error('请选择文件');
      return;
    }

    const formData = new FormData();
    option.fileList.forEach(file => {
      if (checkBeforeUpload(file)) {
        formData.append('files', file);
      }
    });

    try {
      setUploading(true);
      const res = await lastValueFrom(HttpClientService.getInstance().post(option.url, formData));
      if (res.code === 0) {
        fetchResult.current.trigger(res);
        message.success('上传成功');
      } else {
        fetchError.current.trigger(res);
        message.error(res.msg);
      }
    } catch (err) {
      fetchError.current.trigger(err);
    } finally {
      setUploading(false);
    }
  }, [checkBeforeUpload]);

  return {
    uploadMaxSize,
    uploadTypes,
    uploading,
    showUploadMessage,
    setUploadMaxSize,
    setUploadTypes,
    setUploading,
    download,
    downloadFile,
    downloadFileGet,
    // downloadFetch,
    checkBeforeUpload,
    handleUploadWithFormData,
    onResult: fetchResult.current.on,
    onError: fetchError.current.on,
    getHeaders
  };
};