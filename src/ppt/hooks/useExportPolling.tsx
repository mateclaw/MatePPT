import { useEffect, useRef, useState } from 'react';
import { notification, Progress } from 'antd';
import { ExportTaskPo } from '@/models/exportTaskPo';
import { useMemoizedFn } from 'ahooks';
import { CreateMode } from '@/stores/pptProjectStore';
import { ClassicService } from '@/services/classic.service';
import { CreationService } from '@/services/creation.service';
import { saveAs } from 'file-saver';

export interface ExportPollingOptions {
  projectId: number;
  exportFormat: string;
  createMode: CreateMode;
}

const classicService = ClassicService.getInstance();
const creationService = CreationService.getInstance();

const getCreateTaskQ = (createMode: string, param: ExportTaskPo) => {
  return createMode === 'classic'
    ? classicService.createExportTask(param)
    : creationService.createExportTask(param);
};

const getStatusTaskQ = (createMode: string, param: ExportTaskPo) => {
  return createMode === 'classic'
    ? classicService.getExportTaskStatus(param)
    : creationService.getExportTaskStatus(param);
};

export const useExportPolling = () => {
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationKeyRef = useRef<string | null>(null);
  const progressRef = useRef(0);
  const [isPolling, setIsPolling] = useState(false);
  const isWaitingForResponseRef = useRef(false);

  const stopPolling = useMemoizedFn(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    isWaitingForResponseRef.current = false;
    setIsPolling(false);
  });

  const updateProgressNotification = useMemoizedFn((notifyKey: string) => {
    notification.open({
      message: '正在导出 PPT 文件...',
      description: (
        <div>
          <Progress percent={progressRef.current} size="small" />
        </div>
      ),
      duration: 0,
      closable: false,
      placement: 'topRight',
      type: 'info',
      key: notifyKey,
    });
  });

  const startPolling = useMemoizedFn((options: ExportPollingOptions) => {
    const { projectId, exportFormat, createMode } = options;

    const createTaskRequest = new ExportTaskPo();
    createTaskRequest.projectId = projectId;
    createTaskRequest.exportFormat = exportFormat;

    setIsPolling(true);
    progressRef.current = 0;

    const createTaskQ = getCreateTaskQ(createMode, createTaskRequest);

    createTaskQ.subscribe({
      next: (res) => {
        if (!res.data?.taskId) {
          notification.error({
            message: '导出失败',
            description: '无法创建导出任务',
            duration: 3,
          });
          setIsPolling(false);
          return;
        }

        const taskId = res.data.taskId;
        const notifyKey = `export-task-${taskId}`;
        notificationKeyRef.current = notifyKey;

        updateProgressNotification(notifyKey);

        pollingIntervalRef.current = setInterval(() => {
          if (isWaitingForResponseRef.current) {
            progressRef.current = Math.min(70, Math.round(progressRef.current + Math.random() * 3 + 1));
            updateProgressNotification(notifyKey);
            return;
          }

          isWaitingForResponseRef.current = true;

          const statusRequest = new ExportTaskPo();
          statusRequest.projectId = projectId;
          statusRequest.taskId = taskId;

          const statusQ = getStatusTaskQ(createMode, statusRequest);

          statusQ.subscribe({
            next: (statusRes) => {
              const code = statusRes.code;
              if (code !== 0) {
                throw new Error(statusRes.msg || '导出任务执行失败');
              }

              const status = statusRes.data?.status;
              isWaitingForResponseRef.current = false;

              if (status === 0) {
                progressRef.current = Math.min(70, Math.round(progressRef.current + Math.random() * 3 + 1));
                updateProgressNotification(notifyKey);
                return;
              }

              if (status === 1) {
                stopPolling();

                const downloadUrl = statusRes.data?.downloadUrl;
                const fileName = statusRes.data?.fileName || `export.${exportFormat}`;
                if (downloadUrl) {
                  saveAs(downloadUrl, fileName);
                }

                notification.success({
                  message: '导出成功',
                  description: '文件导出完成，开始下载',
                  duration: 3,
                  placement: 'topRight',
                  key: notifyKey,
                });
                return;
              }

              if (status === 2) {
                stopPolling();
                notification.error({
                  message: '导出失败',
                  description: statusRes.data?.taskStatusDesc || '导出任务执行失败',
                  duration: 0,
                  placement: 'topRight',
                  key: notifyKey,
                });
              }
            },
            error: (err) => {
              isWaitingForResponseRef.current = false;
              console.error('查询导出状态失败:', err);
              stopPolling();
              notification.open({
                message: '导出失败',
                description: '导出任务执行失败',
                duration: 0,
                placement: 'topRight',
                type: 'error',
                key: notifyKey,
              });
            },
          });
        }, 3000);
      },
      error: (err) => {
        console.error('创建导出任务失败:', err);
        setIsPolling(false);
        notification.error({
          message: '导出失败',
          description: '无法创建导出任务',
          duration: 3,
          placement: 'topRight',
        });
      },
    });
  });

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      isWaitingForResponseRef.current = false;
    };
  }, []);

  return {
    startPolling,
    stopPolling,
    isPolling,
  };
};
