import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'umi';
import LoadingComponent from '@/components/base/loading';
import { usePptProjectStore } from '@/stores/pptProjectStore';

const PptEditorRedirectPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyAndLoadProject } = usePptProjectStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__PPT_ROUTE_DEBUG__ = {
        page: 'ppt-detail.editor',
        id,
        search: location.search,
        state: location.state,
      };
      console.log('[ppt-debug] redirect page loaded', (window as any).__PPT_ROUTE_DEBUG__);
    }

    if (!id) return;

    const stateParams = location.state as any;
    const nextState = { ...stateParams, createMode: 'classic' };

    if (stateParams?.createMode) {
      navigate(`/ppt/detail/${id}/editor-classic${location.search || ''}`, {
        replace: true,
        state: nextState,
      });
      return;
    }

    verifyAndLoadProject(id)
      .then(() => {
        navigate(`/ppt/detail/${id}/editor-classic${location.search || ''}`, {
          replace: true,
          state: nextState,
        });
      })
      .catch(() => {
        navigate('/ppt/new');
      });
  }, [id, location.search, location.state, navigate, verifyAndLoadProject]);

  return <LoadingComponent />;
};

export default PptEditorRedirectPage;
