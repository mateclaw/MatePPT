import { Link, Outlet, useLocation, useRouteProps, useRoutes, useRouteData, useSelectedRoutes, matchRoutes } from 'umi';
import styles from './index.less';
import { Breadcrumb, Layout, Menu, theme, Divider } from 'antd';

const { Header, Content, Sider } = Layout;
import MateSidebar from "./sidebars/mate-sidebar";
import SubSidebar from "./sidebars/sub-sidebar";
import MateFooter from "./footers/mate-footer";
import { sysRoutes } from "@/routes";

import { useBoolean, useSafeState } from 'ahooks';
import { SysRightPo } from "@/models/sysRightPo";
import { iRoute } from '@/types/base';
import { useEffect, useMemo, useState } from 'react';
import cn from "@/utils/classnames";
import useSystemStore from "@/stores/systemStore";
import useAuthStore from "@/stores/authStore";
import EduHeader from './headers/edu-header';
import MobileHeader from './headers/mobile-header';
import { FeedbackButton } from "@/components/base/Feedback/FeedbackButton";
import { FeedbackModal } from "@/components/base/Feedback/FeedbackModal";
import { useEventStore } from "@/stores/eventStore";
import useBreakpoints, { MediaType } from "@/hooks/use-breakpoints";




export default function () {
  const location = useLocation();
  const routes = useSelectedRoutes();
  const media = useBreakpoints();
  const isMobile = media === MediaType.mobile || media === MediaType.tablet;

  const systemStore = useSystemStore();



  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [collapsed, { toggle }] = useBoolean(false);

  const authStore = useAuthStore();

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useSafeState(false);

  const onFeedbackClick = () => {

    setIsFeedbackModalOpen(true);
  };


  const eventStore = useEventStore();

  useEffect(() => {
    
    const unsubscribe = eventStore.on('Feedback/ButtonClick', ({ event, data }) => {
      
      onFeedbackClick();
      // 执行页面逻辑...
    });

    // 组件卸载时自动取消监听
    return unsubscribe;
  }, []);


  // const menuList = [
  //   {
  //     rightId: 1,
  //     parentId: 0,
  //     rightName: '工作台',
  //     rightObject: 'menu',
  //     pageUrl: '/home',
  //     description: '',
  //     icon: 'local:menu-icon/worktable',
  //     sortCode: 1,
  //     status: 1,

  //   },
  //   {
  //     rightId: 2,
  //     parentId: 0,
  //     rightName: 'GPT对话',
  //     rightObject: 'menu',
  //     pageUrl: '/gpt-chat',
  //     description: '',
  //     icon: 'local:menu-icon/gpt-chat',
  //     sortCode: 2,
  //     status: 1,

  //   },
  //   {
  //     rightId: 3,
  //     parentId: 0,
  //     rightName: '知识库',
  //     rightObject: 'menu',
  //     pageUrl: '/kb',
  //     description: '',
  //     icon: 'local:menu-icon/kb',
  //     sortCode: 2,
  //     status: 1,

  //   },
  //   {
  //     rightId: 4,
  //     parentId: 0,
  //     rightName: '智能数问',
  //     rightObject: 'menu',
  //     pageUrl: '/db',
  //     description: '',
  //     icon: 'local:menu-icon/db',
  //     sortCode: 2,
  //     status: 1,

  //   },
  //   {
  //     rightId: 5,
  //     parentId: 0,
  //     rightName: '知识图谱',
  //     rightObject: 'menu',
  //     pageUrl: '/graph',
  //     description: '',
  //     icon: 'local:menu-icon/graph',
  //     sortCode: 2,
  //     status: 1,

  //   },
  //   {
  //     rightId: 6,
  //     parentId: 0,
  //     rightName: '智能体',
  //     rightObject: 'menu',
  //     pageUrl: '/agent',
  //     description: '',
  //     icon: 'local:menu-icon/agent',
  //     sortCode: 2,
  //     status: 1,

  //   },
  //   {
  //     rightId: 7,
  //     parentId: 0,
  //     rightName: '系统管理',
  //     rightObject: 'menu',
  //     pageUrl: '/system',
  //     description: '',
  //     icon: 'local:menu-icon/system',
  //     sortCode: 2,
  //     status: 1,

  //   },
  // ] as SysRightPo[];

  const [currentMenu, setCurrentMenu] = useState(null);
  const [subMenuList, setSubMenuList] = useState([]);
  const currentRoute: iRoute = useRouteProps();
  // useEffect(() => {
  //   for (let i = 0; i < authStore.userMenuTree.length; i++) {
  //     for (let j = 0; j < routes.length; j++) {
  //       const route = routes[j];

  //       console.log(route)
  //       if(authStore.userMenuTree[i].pageUrl === route.pathname || authStore.userMenuTree[i].pageUrl === route.route.path  ){
  //         setCurrentMenu(authStore.userMenuTree[i]);
  //         setSubMenuList(authStore.userMenuTree[i].children || []);
  //         break;
  //       }
  //     }
  //   }
  // }, [routes]);

  // useEffect(() => {
  //   console.log(location.pathname);
  //   systemStore.setSubmenuIcon('');
  //   systemStore.setSubmenuName('');

  // }, [location.pathname]);
  const submenuIcon = useSystemStore(state => state.submenuIcon);
  const submenuName = useSystemStore(state => state.submenuName);
  // 在组件内
  useEffect(() => {

    const matches = matchRoutes(authStore.userMenuList.map(x => { return { path: x.pageUrl } }), location.pathname);

    if (matches?.length) {
      const matchedMenu = matches[matches.length - 1].route;

      const currMenu = authStore.userMenuList.find((menu) => {
        return menu.pageUrl === matchedMenu.path;
      })



      const activeMenu = authStore.userRightList.find((menu) => { return menu.pageUrl === currentRoute.activeMenu });
      if (!currMenu) {
        return;
      }

      const resolveTopMenu = (menu) => {
        let current = menu;
        while (current && current.parentId !== 0) {
          const parent = authStore.userRightList.find((item) => item.rightId === current.parentId);
          if (!parent) break;
          current = parent;
        }
        return current || menu;
      };
      const topMenu = resolveTopMenu(currMenu);
      const topMenuNode = authStore.userMenuTree.find((menu) => menu.rightId === topMenu.rightId) || topMenu;
      setCurrentMenu(topMenuNode);
      setSubMenuList(topMenuNode.children || []);
    }
    else {
      const activeMenu = authStore.userRightList.find((menu) => { return menu.pageUrl === currentRoute.activeMenu });
      if (activeMenu) {
        let topMenu;
        if (activeMenu.parentId === 0) {
          topMenu = activeMenu;
        } else {
          topMenu = authStore.userMenuTree.find((menu) => {
            return menu.rightId === activeMenu.parentId;
          })

        }

        setCurrentMenu(topMenu);
        setSubMenuList(topMenu.children || []);
      }
    }

  }, [authStore.userMenuList, location.pathname]);


  const showSubMenu = useMemo(() => {
    // return currentRoute?.routes && currentRoute?.routes?.length > 0

    const lstMenu = routes.at(-1);
    if (lstMenu && lstMenu.params && lstMenu.params.id == '-1' && lstMenu.pathname.includes('update')) {
      // update页面，新增的情况下不显示二级菜单
      return false;
    }
    return currentRoute.submenuRender;
  }, [currentRoute]);


  const showFeedbackButton = useMemo(() => {
    // return currentRoute.showFeedbackButton;
    return !showSubMenu;
  }, [showSubMenu]);

  // 判断是否在首页路由下
  const isHomePage = useMemo(() => {
    return location.pathname.startsWith('/home');
  }, [location.pathname]);

  const showSidebar = useMemo(() => {
    return !isHomePage && showSubMenu && !isMobile;
  }, [isHomePage, showSubMenu, isMobile]);

  const menuTree = useMemo(() => {
    const pptMenu = authStore.userMenuTree.filter((menu) => {
      return !menu.hideInMenu;
    })



    return pptMenu

  }, [authStore.userMenuTree]);






  const toggleCollapse = () => {
    // console.log('toggleCollapse');
    toggle();
  };



  return (
    <Layout className={`${styles.layout}  `}>
      {isHomePage && <EduHeader />}
      {isMobile && !isHomePage && showSubMenu && <MobileHeader />}
      <Layout className=''>
        {showSidebar && <MateSidebar collapsed={collapsed} menuList={menuTree} currentMenu={currentMenu} toggleCollapse={toggleCollapse} onFeedbackClick={onFeedbackClick} />}
        <Content
          className=''
          style={{
            // minHeight: 280,


            // borderRadius: borderRadiusLG,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >

          {/* {showSubMenu && showSidebar && subMenuList.length > 0 && <SubSidebar icon={submenuIcon} name={submenuName} menuList={subMenuList} />} */}
          <div style={{ background: 'var(--linear-background-light)' }} className={cn('flex-1 overflow-auto  ', currentRoute?.pageClassname)} >
            <Outlet />

            {isHomePage && <MateFooter />}

            {/* {showFeedbackButton && <FeedbackButton onClick={onFeedbackClick}  />} */}
          </div>

          <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
        </Content>
      </Layout>
    </Layout>
  );
}
