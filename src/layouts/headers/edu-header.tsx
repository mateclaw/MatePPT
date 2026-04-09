import { useTranslate } from '@/hooks/common-hooks';
import { useNavigateWithFromState } from '@/hooks/route-hook';
import { DownOutlined, GlobalOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Dropdown, Layout, Space, theme } from 'antd';
import { ReactNode, useCallback, useMemo, useState, createContext, useContext } from 'react';
import { Icon, useNavigate } from 'umi';
import { useTheme } from '@/components/base/theme-provider';
import useAuthStore from '@/stores/authStore';
import SystemLogo from '@/components/base/system-logo';
import useUserStore from '@/stores/userStore';
import HeaderMenus from './HeaderMenus';
import { config } from "@/config/index";
import useBreakpoints, { MediaType } from "@/hooks/use-breakpoints";


const { Header } = Layout;

// 创建Context用于页面设置Header中间内容
export interface HeaderContextType {
  setMiddleContent: (content: ReactNode | null) => void;
  middleContent: ReactNode | null;
}

const HeaderContext = createContext<HeaderContextType>({
  setMiddleContent: () => { },
  middleContent: null,
});

export const useHeaderContext = () => useContext(HeaderContext);

const EduHeader = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const navigate = useNavigateWithFromState();
  const navDirectly = useNavigate();
  const { t } = useTranslate();
  const appConf = config; // 从配置或环境变量中获取应用名称
  const { theme: themeRag } = useTheme();
  const { userMenuList } = useAuthStore();
  const { userInfo, accessToken } = useUserStore();
  const [middleContent, setMiddleContent] = useState<ReactNode | null>(null);
  const media = useBreakpoints();
  const isMobile = media === MediaType.mobile || media === MediaType.tablet;

  const handleLogoClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleLogout = useCallback(() => {
    // 清除登录状态
    
    navDirectly('/login');
  }, [navDirectly]);

  // 多语言菜单
  const languageMenuItems = useMemo(
    () => [
      {
        key: 'zh-CN',
        label: '中文',
      },
      {
        key: 'en-US',
        label: 'English',
      },
    ],
    [],
  );

  const handleLanguageChange = useCallback((key: string) => {
    localStorage.setItem('umi_locale', key);
    window.location.reload();
  }, []);

  // 用户菜单
  const userMenuItems = useMemo(
    () => [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: t('common.account.profile') || 'Profile',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: t('common.account.logout') || 'Logout',
        danger: true,
      },
    ],
    [t],
  );

  const handleUserMenuClick = useCallback(
    (key: string) => {
      if (key === 'logout') {
        handleLogout();
      } else if (key === 'profile') {
        navigate('/user/profile');
      }
    },
    [navigate, handleLogout],
  );

  const headerContextValue: HeaderContextType = useMemo(
    () => ({
      setMiddleContent,
      middleContent,
    }),
    [middleContent],
  );

  return (
    <HeaderContext.Provider value={headerContextValue}>
      <Header
        className="max-md:!px-3 max-md:!h-[56px]"
        style={{
          padding: '0 24px 0 14px',
          background: `rgba(255, 255, 255, 0.2)`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '80px',
          width: '100%',
          // boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          position:'fixed',
          zIndex: 100,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          color: 'transparent',
        }}
      >
        {/* 左侧：Logo */}
        <div
          className='flex-none flex justify-center items-center gap-2'
          onClick={handleLogoClick}
          style={{
            color: 'inherit',
          }}
        >
          <Space size={12}>
            <SystemLogo size={56} />
            <span
              className='text-xl font-bold'
              style={{
                color: 'inherit',
              }}
            >
              {appConf.appName}
            </span>
          </Space>
        </div>

        {/* 中间：页面自定义内容（移动端隐藏菜单） */}
        <div
          className="hidden md:flex"
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 24px',
            color: 'inherit',
          }}
        >
          {middleContent || <HeaderMenus />}
        </div>

        {/* 右侧：语言切换和用户菜单 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            justifyContent: 'flex-end',
            color: 'inherit',
          }}
        >
          {/* 语言切换（移动端隐藏） */}
          <Dropdown
            menu={{
              items: languageMenuItems,
              onClick: (info) => handleLanguageChange(info.key),
            }}
            trigger={['click']}
          >
            <Button
              type="text"
              size="large"
              className="hidden md:inline-flex"
              style={{
                padding: '4px 8px',
              }}

            >
              <Icon icon="local:icon-locale" width='24' height='24' />
              {t('language') || 'Language'}
              <DownOutlined />
            </Button>
          </Dropdown>

          {/* 用户菜单 */}
          {userInfo && userInfo.userId > 0 ? (
            isMobile ? (
              <Button
                type="primary"
                size="small"
                onClick={() => navigate('/ppt/my-works')}
              >
                我的作品
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={() => navigate('/ppt/new')}
                style={{
                  padding: '4px 22px',
                }}
              >
                {t('common.menus.workspace')}
              </Button>
            )
          ) : (
            <Button
              type="primary"
              size={isMobile ? 'small' : 'middle'}
              style={isMobile ? undefined : {
                padding: '4px 22px',
              }}
              onClick={() => navigate('/login')}
            >
              {t('login.signBtn') || 'Login'}
            </Button>
          )}
        </div>
      </Header>
    </HeaderContext.Provider>
  );
};

export default EduHeader;
