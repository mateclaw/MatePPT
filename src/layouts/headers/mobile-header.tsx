import { Layout, Avatar, Button, Dropdown } from 'antd';
import { LeftOutlined, FolderOutlined, HomeOutlined, LogoutOutlined } from '@ant-design/icons';
import { history, useLocation } from 'umi';
import useUserStore from '@/stores/userStore';
import SystemLogo from '@/components/base/system-logo';
import { config } from '@/config';

const { Header } = Layout;

const handleAvatarMenu = ({ key }: { key: string }) => {
  if (key === 'home') history.push('/ppt/new');
  else if (key === 'works') history.push('/ppt/my-works');
  else if (key === 'logout') history.push('/login');
};

const MobileHeader = () => {
  const { pathname } = useLocation();
  const { userInfo } = useUserStore();
  const isLogin = !!userInfo?.userId;

  // 在首页和作品列表页不显示返回按钮
  const isRootPage = pathname === '/ppt/new' || pathname === '/ppt/my-works';

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      history.push('/ppt/my-works');
    }
  };

  const avatarNode = userInfo?.avatarUrl ? (
    <Avatar size={28} src={userInfo.avatarUrl} className="cursor-pointer" />
  ) : (
    <Avatar size={28} className="cursor-pointer" style={{ backgroundColor: 'rgb(106, 94, 245)', color: '#fff', fontSize: 12 }}>
      {userInfo?.userName ? userInfo.userName.charAt(0).toUpperCase() : ''}
    </Avatar>
  );

  return (
    <Header
      style={{
        padding: '0 12px',
        background: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '48px',
        lineHeight: '48px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexShrink: 0,
      }}
    >
      <div className="flex items-center gap-2">
        {!isRootPage ? (
          <LeftOutlined className="text-base cursor-pointer p-1" onClick={handleBack} />
        ) : (
          <SystemLogo size={28} />
        )}
        <span className="text-sm font-semibold truncate" style={{ maxWidth: '160px' }}>
          {config.appName}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {isLogin && pathname !== '/ppt/my-works' && (
          <Button
            type="text"
            size="small"
            icon={<FolderOutlined />}
            onClick={() => history.push('/ppt/my-works')}
          >
            我的作品
          </Button>
        )}
        {isLogin ? (
          <Dropdown trigger={['click']} menu={{
            items: [
              { key: 'home', icon: <HomeOutlined />, label: '首页' },
              ...(pathname !== '/ppt/my-works' ? [{ key: 'works', icon: <FolderOutlined />, label: '我的作品' }] : []),
              { type: 'divider' as const },
              { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
            ],
            onClick: handleAvatarMenu,
          }}>
            {avatarNode}
          </Dropdown>
        ) : (
          <Button type="primary" size="small" onClick={() => history.push('/login')}>
            登录
          </Button>
        )}
      </div>
    </Header>
  );
};

export default MobileHeader;
