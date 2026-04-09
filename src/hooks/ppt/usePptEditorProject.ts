import { useEffect, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import { useMemoizedFn } from 'ahooks';
import { message as AntMessage } from 'antd';
import { usePptProjectStore } from '@/stores/pptProjectStore';
import { PptProjectService } from '@/services/pptProject.service';
import { PptProjectPo } from '@/models/pptProjectPo';

interface UsePptEditorProjectOptions {
  projectId?: string;
  allowStatusCheckRef: MutableRefObject<boolean>;
  onReset: () => void;
  onProjectLoaded: (detail: PptProjectPo) => void;
  onProjectMissing: () => void;
  onStatusUpdate: (detail: PptProjectPo) => void;
}

export const usePptEditorProject = ({
  projectId,
  allowStatusCheckRef,
  onReset,
  onProjectLoaded,
  onProjectMissing,
  onStatusUpdate,
}: UsePptEditorProjectOptions) => {
  const [loadingDetail, setLoadingDetail] = useState(true);
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const verifyAndLoadProject = usePptProjectStore((state) => state.verifyAndLoadProject);
  const callbacksRef = useRef({
    onReset,
    onProjectLoaded,
    onProjectMissing,
    onStatusUpdate,
  });

  useEffect(() => {
    callbacksRef.current = {
      onReset,
      onProjectLoaded,
      onProjectMissing,
      onStatusUpdate,
    };
  }, [onReset, onProjectLoaded, onProjectMissing, onStatusUpdate]);

  const stopStatusCheck = useMemoizedFn(() => {
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
      statusCheckIntervalRef.current = null;
    }
  });

  const startStatusCheck = useMemoizedFn((id: string) => {
    if (!allowStatusCheckRef.current) {
      return;
    }

    stopStatusCheck();

    statusCheckIntervalRef.current = setInterval(() => {
      const pptProjectService = PptProjectService.getInstance();
      pptProjectService.detail({ projectId: id } as PptProjectPo).subscribe({
        next: (response) => {
          const updatedProject = response.data;
          if (!updatedProject) return;
          callbacksRef.current.onStatusUpdate(updatedProject);
        },
        error: (error) => {
          console.error('[editor] 查询项目状态失败:', error);
        },
      });
    }, 10000);
  });

  useEffect(() => {
    if (!projectId) return;
    setLoadingDetail(true);
    callbacksRef.current.onReset();
    allowStatusCheckRef.current = true;
    verifyAndLoadProject(projectId)
      .then(() => {
        const currentDetail = usePptProjectStore.getState().projectDetail;
        setLoadingDetail(false);
        if (currentDetail) {
          callbacksRef.current.onProjectLoaded(currentDetail);
        } else {
          AntMessage.error('项目不存在');
          callbacksRef.current.onProjectMissing();
        }
      })
      .catch(() => {
        setLoadingDetail(false);
        AntMessage.error('项目不存在');
        callbacksRef.current.onProjectMissing();
      });

    return () => {
      stopStatusCheck();
    };
  }, [projectId, verifyAndLoadProject, stopStatusCheck]);

  return {
    loadingDetail,
    startStatusCheck,
    stopStatusCheck,
  };
};
