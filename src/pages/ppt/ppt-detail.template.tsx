import React, { useEffect, useState } from 'react';
import { message as AntMessage } from 'antd';
import LoadingComponent from '@/components/base/loading';
import PptTemplateSelector, { type FilterCriteria } from '@/ppt/classic/components/PptTemplateSelector';
import { usePptProjectStore } from '@/stores/pptProjectStore';
import { useNavigate, useParams } from 'umi';

const PptTemplatePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loadingDetail, setLoadingDetail] = useState(true);
  const { projectId, saveSelectedTemplate, setCreateMode, verifyAndLoadProject } = usePptProjectStore();

  useEffect(() => {
    if ((!projectId && id) || projectId !== id) {
      verifyAndLoadProject(id)
        .then(() => {
          setLoadingDetail(false);
        })
        .catch(() => {
          AntMessage.error('项目不存在');
          navigate('/ppt/new');
        });
      return;
    }

    setLoadingDetail(false);
  }, [id, navigate, projectId, verifyAndLoadProject]);

  const handleSelectTemplate = (templateId: string, filter: FilterCriteria) => {
    const nextFilter = { ...filter, createMode: 'classic' };
    saveSelectedTemplate(templateId, nextFilter);
    setCreateMode('classic');

    navigate(`/ppt/detail/${id}/editor-classic`, {
      state: { createMode: 'classic', filter: nextFilter, templateId },
    });
  };

  return (
    <div className="h-full w-full">
      {loadingDetail && <LoadingComponent />}

      {!loadingDetail && (
        <PptTemplateSelector
          preStep={() => {
            navigate(`/ppt/detail/${id}/outline`);
          }}
          nextStep={handleSelectTemplate}
          templates={[]}
          createMode="classic"
        />
      )}
    </div>
  );
};

export default PptTemplatePage;
