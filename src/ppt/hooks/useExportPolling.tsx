import { useCallback, useRef, useEffect, useState } from 'react';
import { notification, Progress } from 'antd';
import { PptProjectService } from '@/services/pptProject.service';
import { ExportTaskPo } from '@/models/exportTaskPo';
import { useMemoizedFn } from 'ahooks';
import { CreateMode } from '@/stores/pptProjectStore';
import { ClassicService } from '@/services/classic.service';
import { CreationService } from "@/services/creation.service";
import { saveAs } from 'file-saver';


export interface ExportPollingOptions {
  projectId: number;
  exportFormat: string; // 'pptx' | 'pdf' | 'html'
  createMode: CreateMode;
}

const classicService = ClassicService.getInstance();
const creationService = CreationService.getInstance();

const getCreateTaskQ = (createMode: string, param) => {
  return createMode === 'classic' ? classicService.createExportTask(param) : creationService.createExportTask(param);
}
const getStatusTaskQ = (createMode: string, param) => {
  return createMode === 'classic' ? classicService.getExportTaskStatus(param) : creationService.getExportTaskStatus(param);
}



export const useExportPolling = () => {
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationKeyRef = useRef<string | null>(null);
  const progressRef = useRef(0);
  const [isPolling, setIsPolling] = useState(false);
  const isWaitingForResponseRef = useRef(false);


  //   const closeNotification = useMemoizedFn(() => {
  //     if (notificationKeyRef.current) {
  //       // Use destroy to close notification
  //       setTimeout(() => {
  //         const element = document.querySelector(`[data-key="${notificationKeyRef.current}"]`);
  //         if (element) {
  //           element.remove();
  //         }
  //       }, 0);
  //       notificationKeyRef.current = null;
  //     }
  //   });

  const stopPolling = useMemoizedFn(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    isWaitingForResponseRef.current = false;
    setIsPolling(false);
  });


  const startPolling = useMemoizedFn((options: ExportPollingOptions) => {
    const { projectId, exportFormat, createMode } = options;
    const pptProjectService = PptProjectService.getInstance();

    // 第一步：创建导出任务
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

        // 显示初始进度条通知
        progressRef.current = 0;
        const notifyKey = `export-task-${taskId}`;
        notificationKeyRef.current = notifyKey;

        notification.open({
          message: '正在导出PPT文件...',
          description: (<>
            <div>
              <Progress percent={progressRef.current} size="small" />
            </div>
          </>),
          duration: 0, // 不自动关闭
          closable: false,
          placement: 'topRight',
          type: 'info',
          key: notifyKey,
        });

        // 第二步：开始轮询查询任务状态
        let pollCount = 0;
        pollingIntervalRef.current = setInterval(() => {
          pollCount++;

          // 如果还在等待上一次的响应，则只更新进度条，不发起新的请求
          if (isWaitingForResponseRef.current) {
            progressRef.current = Math.min(
              70,
              Math.round(progressRef.current + Math.random() * 3 + 1)
            );

            notification.open({
              message: '正在导出PPT文件...',
              description: (<>
                <div>
                  <Progress percent={progressRef.current} size="small" />
                </div>
              </>),
              duration: 0,
              closable: false,
              placement: 'topRight',
              type: 'info',
              key: notifyKey,
            });
            return;
          }

          // 标记正在等待响应
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
                // 继续轮询：更新前端伪造的进度条（每秒加一些，最大70%）
                progressRef.current = Math.min(
                  70,
                  Math.round(progressRef.current + Math.random() * 3 + 1)
                );

                notification.open({
                  message: '正在导出PPT文件...',
                  description: (<>
                    <div>
                      <Progress percent={progressRef.current} size="small" />
                    </div>
                  </>),
                  closable: false,
                  duration: 0,
                  placement: 'topRight',
                  type: 'info',
                  key: notifyKey,
                });
              } else if (status === 1) {
                // 成功：下载文件
                stopPolling();


                const downloadUrl = statusRes.data?.downloadUrl;
                const fileName = statusRes.data?.fileName || `export.${exportFormat}`;
                if (downloadUrl) {
                  // const link = document.createElement('a');
                  // link.href = downloadUrl;
                  // link.download = statusRes.data?.fileName || `export.${exportFormat}`;
                  // document.body.appendChild(link);
                  // link.click();
                  // document.body.removeChild(link);
                  saveAs(downloadUrl, fileName);
                }

                notification.success({
                  message: '导出成功',
                  description: '文件导出完成，稍后开始下载',
                  duration: 3,
                  placement: 'topRight',
                  key: notifyKey,
                });
              } else if (status === 2) {
                // 失败：显示错误信息
                stopPolling();


                notification.error({
                  message: '导出失败',
                  description:
                    statusRes.data?.taskStatusDesc || '导出任务执行失败',
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
        }, 3 * 1000); // 每3秒轮询一次
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

  // 清理效果
  useEffect(() => {
    return () => {
      // if (pollingIntervalRef.current) {
      //   clearInterval(pollingIntervalRef.current);
      // }
      // isWaitingForResponseRef.current = false;
    };
  }, []);

  return {
    startPolling,
    stopPolling,

    isPolling,
  };
};
