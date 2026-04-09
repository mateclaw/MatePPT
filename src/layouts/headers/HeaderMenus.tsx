/**
 * Header 中间菜单组件
 * 在首页及其子页面显示 Tab 菜单（产品、方案、定价、合作）
 */

import { Tabs, TabsProps } from 'antd';
import { useLocation, useNavigate } from 'umi';
import { useTranslate } from '@/hooks/common-hooks';
import { getHomeTabMenus, isInHomePage, MenuItemWithChildren } from '@/config/menus';
import { useMemo, useCallback, useEffect } from 'react';

interface HeaderMenusProps {
  /**
   * 是否显示菜单，通常在首页及子页面显示
   */
  visible?: boolean;
}

const HeaderMenus: React.FC<HeaderMenusProps> = ({ visible = true }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslate();

  // 获取首页的 Tab 菜单（不包括首页本身）
  const homeTabMenus = useMemo<MenuItemWithChildren[]>(() => {
    const menus = getHomeTabMenus();
    // 过滤掉首页本身，只保留产品、方案、定价、合作
    return menus.filter((menu) => menu.rightId !== 101001);
  }, []);

  // 获取当前激活的 Tab
  const activeKey = useMemo(() => {
    // 根据当前路径获取对应的菜单项
    const currentMenu = homeTabMenus.find((menu) => menu.pageUrl === pathname);
    return currentMenu?.pageUrl || '/home/product';
  }, [pathname, homeTabMenus]);

  // 处理 Tab 切换
  const handleTabChange = useCallback(
    (key: string) => {
      navigate(key);
    },
    [navigate],
  );

  // 构建 Tab 项
  const tabItems: TabsProps['items'] = useMemo(
    () =>
      homeTabMenus.map((menu) => ({
        key: menu.pageUrl,
        label: t(menu.i18nKey || 'menus.home') || menu.rightName,
      })),
    [homeTabMenus, t],
  );

  // 判断是否应该显示菜单
  const shouldShow = visible && isInHomePage(pathname);

  if (!shouldShow) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
      }}
      className="no-bottom-border"
    >
      <Tabs
        activeKey={activeKey}
        items={tabItems}
        onChange={handleTabChange}
        tabBarStyle={{
          margin: 0,
          borderBottom: 'none',
          display: 'flex',
          gap: '32px',
        }}
        style={{
          width: '100%',
        }}
      />
    </div>
  );
};

export default HeaderMenus;
