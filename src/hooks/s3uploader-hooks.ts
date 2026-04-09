import { useState, useCallback } from 'react';
import { App } from 'antd';
import useAuthStore from '@/stores/authStore';
import { autoConvert } from '@/utils/file-util';

interface UseS3UploaderProps {
    uploadTypes?: string;
    uploadPath?: string;
    uploadMaxSize?: number;
    uploadMaxCount?: number;
    manualUpload?: boolean;
    fileList?: any[];
    setFileList?: (fileList: any[]) => void;
    onProgress?: (progress: number) => void;
    onSuccess?: (file: any) => void;
    onError?: (error: Error) => void;
    onChange?: (info: any) => void;
    getUploadTarget?: (file: File) => Promise<UploadTarget | null>;
}
export interface UploadTarget {
    uploadUrl: string;
    fileUrl?: string;
    httpUrl?: string;
    headers?: Record<string, string>;
    fields?: Record<string, string>;
    fileFieldName?: string;
    method?: 'PUT' | 'POST';
}

export const buildDirectUploadTarget = (uploadUrl: string): UploadTarget => ({
    uploadUrl,
    method: 'PUT',
});
const presetTypes = {
    "preset:doc": ".doc,.docx",
    "preset:xls": ".xls,.xlsx",
    "preset:ppt": ".pptx",
    "preset:zip": ".zip,.rar,.7z",
    "preset:pic": ".jpg,.jpeg,.png,.bmp,.webp,.svg"
};
export const useS3Uploader = (props: UseS3UploaderProps) => {
    const {
        uploadTypes = '.xlsx',
        uploadPath = '',
        uploadMaxSize = 1024 * 1024 * 10,
        uploadMaxCount = 1,
        manualUpload = false,
        fileList,
        setFileList,
        onProgress,
        onSuccess,
        onError,
        onChange,
        getUploadTarget
    } = props;

    const { message } = App.useApp();
    const [vFileList, setVfileList] = useState(fileList);
    const [isUploading, setIsUploading] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<any[]>([]);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});



    const fileTypes = uploadTypes.startsWith("preset") ? presetTypes[uploadTypes] : uploadTypes;
    const maxFileSize = autoConvert(uploadMaxSize);
    const getMinioServiceFromStore = useAuthStore((state) => state.getMinioService);
    // const getMinioService = useCallback(() => {
    //     return authStore.getMinioService(uploadPath);
    // }, [authStore, uploadPath]);
    const getMinioService = useCallback(async () => {
        try {
            const service = await getMinioServiceFromStore(uploadPath);
            return service;
        } catch (error) {
            console.error('Failed to initialize minio service:', error);
            throw new Error('获取上传服务失败');
        }
    }, [getMinioServiceFromStore, uploadPath]);

    const uploadByUrl = useCallback((file: File, target: UploadTarget, onProgressCb?: (progress: any) => void) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(target.method || 'PUT', target.uploadUrl, true);

            if (target.headers && typeof target.headers === 'object') {
                Object.entries(target.headers).forEach(([key, value]) => {
                    if (typeof value !== 'undefined') {
                        xhr.setRequestHeader(key, String(value));
                    }
                });
            }

            xhr.upload.addEventListener('progress', (e) => {
                if (onProgressCb) {
                    const percent = Number(`${((e.loaded / e.total) * 100).toFixed(2)}`) || 0;
                    onProgressCb({ percent });
                }
            });

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const fallbackHttpUrl = (target.httpUrl || target.fileUrl || target.uploadUrl).split('?')[0];
                    const suffix = file.name.split('.').pop() || '';
                    resolve({
                        result: {
                            fileUrl: target.fileUrl || target.httpUrl || '',
                            newFileName: target.fileUrl ? String(target.fileUrl).split('/').pop() : file.name,
                            fileId: '',
                            fileSize: file.size,
                            fileType: file.type,
                            fileName: file.name,
                            fileSuffix: suffix,
                            httpUrl: target.httpUrl || (target.fileUrl && String(target.fileUrl).startsWith('http') ? target.fileUrl : '') || fallbackHttpUrl,
                        },
                        xhr,
                        file,
                    });
                } else {
                    reject(new Error(`http code is ${xhr.status}`));
                }
            };

            xhr.onerror = () => reject(new Error('上传失败'));

            if (target.fields && typeof target.fields === 'object') {
                const form = new FormData();
                Object.entries(target.fields).forEach(([key, value]) => {
                    form.append(key, String(value));
                });
                form.append(target.fileFieldName || 'file', file);
                xhr.send(form);
            } else {
                xhr.send(file as any);
            }
        });
    }, []);

    const normalizeUploadedFile = useCallback((file: any, minio?: any) => {
        if (!file?.response?.result) return file;
        const result = file.response.result || {};
        const resolvedHttpUrl =
            result.httpUrl ||
            (typeof result.fileUrl === 'string' && result.fileUrl.startsWith('http') ? result.fileUrl : '') ||
            (minio && result.fileUrl ? minio.getFileUrl(result.fileUrl) : '');

        if (resolvedHttpUrl) {
            file.url = resolvedHttpUrl;
            file.thumbUrl = resolvedHttpUrl;
        }
        if (result.fileUrl) {
            file.fileUrl = result.fileUrl;
        }
        return file;
    }, []);

    const customUpload = useCallback((antdOption: any) => {
        const { onSuccess: antdOnSuccess, onProgress: antdOnProgress, onError: antdOnError } = antdOption;

        setIsUploading(true);
        const uploadPromise = getUploadTarget
            ? getUploadTarget(antdOption.file).then((target) => {
                if (target) {
                    return uploadByUrl(antdOption.file, target, antdOnProgress);
                }
                return null;
            })
            : Promise.resolve(null);

        uploadPromise
            .then((res: any) => {
                if (res) return res;
                return getMinioService().then((minio) =>
                    new Promise((resolve, reject) => {
                        minio.uploadRequest({
                            file: antdOption.file,
                            onSuccess: resolve,
                            onProgress: antdOnProgress,
                            onError: reject,
                        });
                    })
                );
            })
            .then((res: any) => {
                antdOnSuccess(res);
                setIsUploading(false);
                if (onSuccess) {
                    onSuccess(res);
                }
            })
            .catch((err: any) => {
                antdOnError(err);
                setIsUploading(false);
                if (onError) {
                    onError(err);
                }
            });
    }, [getMinioService, onSuccess, onProgress, onError, getUploadTarget, uploadByUrl]);

    const beforeUpload = useCallback((file: File) => {
        // 文件类型验证
        const filetype = file.name.split('.').reverse()[0];
        const isValidType = fileTypes.includes(filetype);
        if (!isValidType) {
            message.error(`仅支持 ${fileTypes} 格式文件`);
            return Promise.reject(new Error(`仅支持 ${fileTypes} 格式文件`));
        }

        if (file.size > uploadMaxSize) {
            message.error(`文件大小超出限制，最大为${maxFileSize}`)
            return Promise.reject(new Error(`文件大小超出限制，最大为${maxFileSize}`));
        }

        // 如果是手动上传模式，只将文件加入待上传列表而不立即上传
        if (manualUpload) {
            return false; // 阻止自动上传
        }

        return true;
    }, [fileTypes, uploadMaxSize, maxFileSize, manualUpload]);

    const notifyFileList = useCallback((nextList: any[]) => {
        if (!setFileList) return;
        queueMicrotask(() => {
            setFileList(nextList);
        });
    }, [setFileList]);

    const onFileChange = useCallback((info: any) => {
        if (onChange) {
            onChange(info);
        }

        let resFileList = [...info.fileList];

        // 验证并过滤不符合条件的文件
        resFileList = resFileList.filter(file => {
            // 检查文件类型
            const filetype = file.name.split('.').reverse()[0];
            const isValidType = fileTypes.includes(filetype);
            if (!isValidType) {
                return false;
            }

            // 检查文件大小
            if (file.size && file.size > uploadMaxSize) {
                return false;
            }

            return true;
        });

        // 在手动上传模式下，更新待上传文件列表
        if (manualUpload) {
            setPendingFiles(resFileList);

        }

        // 这里并没有上传文件，只是更新了文件列表
        const shouldResolveMinio = resFileList.some(file => file?.response?.result && !file?.response?.result?.httpUrl);
        if (!shouldResolveMinio) {
            const mapped = resFileList.map(file => normalizeUploadedFile(file));
            setVfileList(mapped);
            notifyFileList(mapped);
            return;
        }

        getMinioService()
            .then(minio => {
                const mapped = resFileList.map(file => normalizeUploadedFile(file, minio));
                setVfileList(mapped);
                notifyFileList(mapped);
            })
            .catch(() => {
                const mapped = resFileList.map(file => normalizeUploadedFile(file));
                setVfileList(mapped);
                notifyFileList(mapped);
            });
    }, [manualUpload, getMinioService, onChange, fileTypes, uploadMaxSize, normalizeUploadedFile, notifyFileList]);

    const handleManualUpload = useCallback((): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            if (!pendingFiles || pendingFiles.length === 0) {
                message.warning('请先选择文件');
                reject(new Error('No files selected'));
                return;
            }

            setIsUploading(true);
            const uploadPromises = pendingFiles.map(file => {
                return new Promise<any>((resolveFile, rejectFile) => {
                    const originFile = file.originFileObj as File;
                    const uploadPromise = getUploadTarget
                        ? getUploadTarget(originFile).then((target) => {
                            if (target) {
                                return uploadByUrl(originFile, target, (progress: { percent: number }) => {
                                    console.log('上传进度:', progress);
                                    setUploadProgress(prev => ({
                                        ...prev,
                                        [file.uid]: progress.percent
                                    }));
                                    setVfileList(prevList => {
                                        const updatedList = prevList.map(f =>
                                            f.uid === file.uid
                                                ? { ...f, percent: progress.percent, status: 'uploading' }
                                                : f
                                        );
                                        notifyFileList(updatedList);
                                        setPendingFiles(updatedList);
                                        return updatedList;
                                    });
                                    if (onProgress) {
                                        onProgress(progress.percent);
                                    }
                                });
                            }
                            return null;
                        })
                        : Promise.resolve(null);

                    uploadPromise
                        .then((res: any) => {
                            if (res) return res;
                            return getMinioService().then(minio =>
                                new Promise((resolve, reject) => {
                                    minio.uploadRequest({
                                        file: originFile,
                                        onSuccess: resolve,
                                        onError: reject,
                                        onProgress: (progress: { percent: number }) => {
                                            console.log('上传进度:', progress);
                                            setUploadProgress(prev => ({
                                                ...prev,
                                                [file.uid]: progress.percent
                                            }));
                                            setVfileList(prevList => {
                                                const updatedList = prevList.map(f =>
                                                    f.uid === file.uid
                                                        ? { ...f, percent: progress.percent, status: 'uploading' }
                                                        : f
                                                );
                                        notifyFileList(updatedList);
                                        setPendingFiles(updatedList);
                                        return updatedList;
                                    });
                                            if (onProgress) {
                                                onProgress(progress.percent);
                                            }
                                        }
                                    });
                                })
                            );
                        })
                        .then((res: any) => {
                            if (onSuccess) {
                                onSuccess({ ...file, response: res });
                            }
                            setVfileList(prevList => {
                                const updatedList = prevList.map(f =>
                                    f.uid === file.uid
                                        ? { ...f, status: 'done', response: res, percent: 100 }
                                        : f
                                );
                                notifyFileList(updatedList);
                                setPendingFiles(updatedList);
                                return updatedList;
                            });
                            resolveFile({ file, result: res });
                        })
                        .catch(err => {
                            console.error('Upload failed:', err);
                            if (onError) {
                                onError(err);
                            }
                            setVfileList(prevList => {
                                const updatedList = prevList.map(f =>
                                    f.uid === file.uid
                                        ? { ...f, status: 'error' }
                                        : f
                                );
                            notifyFileList(updatedList);
                            setPendingFiles(updatedList);
                            return updatedList;
                        });
                            rejectFile({ file, error: err });
                        });
                });
            });

            Promise.all(uploadPromises)
                .then(results => {
                    console.log('文件上传成功');
                    setIsUploading(false);
                    resolve(results);
                })
                .catch(error => {
                    message.error('文件上传失败');
                    console.error('Upload error:', error);
                    setIsUploading(false);
                    reject(error);
                });
        });
    }, [pendingFiles, getMinioService, onSuccess, onError, onProgress, message]);

    return {
        fileTypes,
        maxFileSize,
        isUploading,
        pendingFiles,
        vFileList,
        uploadProgress,
        customUpload,
        beforeUpload,
        onFileChange,
        handleManualUpload,
        setPendingFiles,
        setIsUploading,
        setVfileList
    };
};
