import { App } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'umi';
import LoadingComponent from '@/components/base/loading';
import { OutlineSlideVo } from '@/models/outlineSlideVo';
import PptOutlineEditor, { TreeManagementRef } from '@/ppt/components/PptOutlineEditor';
import { usePptProjectStore } from '@/stores/pptProjectStore';

const PptOutlinePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef<TreeManagementRef>(null);
  const { message } = App.useApp();

  const [loadingDetail, setLoadingDetail] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { projectId, outlineData, verifyAndLoadProject, saveOutlineToBackend, setOutlineDataWithSync } = usePptProjectStore();

  useEffect(() => {
    if ((!projectId && id) || projectId !== id) {
      verifyAndLoadProject(id)
        .then(() => {
          setLoadingDetail(false);
        })
        .catch((error) => {
          console.error('load project failed', error);
          message.error('项目加载失败');
          navigate('/ppt/new');
        });
      return;
    }

    setLoadingDetail(false);
  }, [id, message, navigate, projectId, verifyAndLoadProject]);

  const handleChange = (newOutlineData: OutlineSlideVo[]) => {
    setOutlineDataWithSync(newOutlineData);
  };

  const handleSubmitAndNext = async () => {
    if (!editorRef.current || !id) {
      return;
    }

    try {
      setIsLoading(true);
      const validatedData = await editorRef.current.getValidatedData();
      if (!validatedData || validatedData.length === 0) {
        message.error('请先完善大纲内容');
        return;
      }

      await saveOutlineToBackend(id, validatedData);
      navigate(`/ppt/detail/${id}/template`);
      message.success('大纲已保存，进入模板选择');
    } catch (error: any) {
      message.error(error?.message || '保存大纲失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full justify-center">
      {loadingDetail && <LoadingComponent />}

      {!loadingDetail && (
        <div className="w-full max-w-[1000px] py-7">
          <PptOutlineEditor
            ref={editorRef}
            initialData={outlineData}
            onChange={handleChange}
            loading={isLoading}
            onSubmitData={handleSubmitAndNext}
            preStep={() => {
              navigate('/ppt/new');
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PptOutlinePage;
