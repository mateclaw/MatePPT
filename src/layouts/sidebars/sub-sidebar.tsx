import { Icon, Link, Outlet, useLocation, history, useParams, matchRoutes, useRouteProps } from 'umi';
import styles from './index.less';
import { Breadcrumb, Layout, Menu, theme, Divider, Button } from 'antd';

import { RightOutlined } from "@ant-design/icons";
import React, { FC, PropsWithChildren, Component, useEffect, useState } from "react";
import SvgIcon from "@/components/base/svg-icon";
import { useIsDarkTheme } from "@/components/base/theme-provider";
import cn from "@/utils/classnames";

import { RiContactsLine } from "@remixicon/react";
import { SysRightPo } from '@/models/sysRightPo';
import useSystemStore from "@/stores/systemStore";
import { iRoute } from '@/types/base';


const { Header, Content, Sider } = Layout;

type MenuItemProps = {
    icon: string;
    name: string;

    // active?: boolean;
    // children?: React.ReactNode;
    // className?: string;
    // collapsed?: boolean;
    // item?: any;
    // onClick?: (e) => void;
    menuList: any[];
    // toggleCollapse: () => void;

};
const SubSidebar: FC<PropsWithChildren<MenuItemProps>> = ({ icon, name, children, collapsed, className, active, onClick, item, menuList }) => {



    if (!menuList || menuList.length == 0) {
        return <></>
    }
    // const menuList = [
    //     {
    //         rightId: 2,
    //         parentId: 0,
    //         rightName: '文档',
    //         rightObject: 'menu',
    //         pageUrl: '/kb/:id/docs',
    //         description: '',
    //         icon: 'local:menu-icon/gpt-chat',
    //         sortCode: 2,
    //         status: 1,

    //     },
    //     {
    //         rightId: 2,
    //         parentId: 0,
    //         rightName: '问答对',
    //         rightObject: 'menu',
    //         pageUrl: '/kb/:id/qa',
    //         description: '',
    //         icon: 'local:menu-icon/gpt-chat',
    //         sortCode: 2,
    //         status: 1,

    //     },
    //     {
    //         rightId: 3,
    //         parentId: 0,
    //         rightName: '召回测试',
    //         rightObject: 'menu',
    //         pageUrl: '/kb/:id/recall',
    //         description: '',
    //         icon: 'local:menu-icon/gpt-chat',
    //         sortCode: 2,
    //         status: 1,

    //     },
    //     {
    //         rightId: 4,
    //         parentId: 0,
    //         rightName: '设置',
    //         rightObject: 'menu',
    //         pageUrl: '/kb/:id/setting',
    //         description: '',
    //         icon: 'local:menu-icon/gpt-chat',
    //         sortCode: 2,
    //         status: 1,

    //     },
    //     // {
    //     //     rightId: 1,
    //     //     parentId: 0,
    //     //     rightName: '部门管理',
    //     //     rightObject: 'menu',
    //     //     pageUrl: '/system/dept',
    //     //     description: '',
    //     //     icon: 'local:menu-icon/worktable',
    //     //     sortCode: 1,
    //     //     status: 1,

    //     // },
    //     // {
    //     //     rightId: 2,
    //     //     parentId: 0,
    //     //     rightName: '角色管理',
    //     //     rightObject: 'menu',
    //     //     pageUrl: '/system/role',
    //     //     description: '',
    //     //     icon: 'local:menu-icon/gpt-chat',
    //     //     sortCode: 2,
    //     //     status: 1,

    //     // },
    //     // {
    //     //     rightId: 3,
    //     //     parentId: 0,
    //     //     rightName: '用户管理',
    //     //     rightObject: 'menu',
    //     //     pageUrl: '/system/user',
    //     //     description: '',
    //     //     icon: 'local:menu-icon/kb',
    //     //     sortCode: 2,
    //     //     status: 1,

    //     // },
    //     // {
    //     //     rightId: 4,
    //     //     parentId: 0,
    //     //     rightName: '智能数问',
    //     //     rightObject: 'menu',
    //     //     pageUrl: '/db',
    //     //     description: '',
    //     //     icon: 'local:menu-icon/db',
    //     //     sortCode: 2,
    //     //     status: 1,

    //     // },
    //     // {
    //     //     rightId: 5,
    //     //     parentId: 0,
    //     //     rightName: '知识图谱',
    //     //     rightObject: 'menu',
    //     //     pageUrl: '/graph',
    //     //     description: '',
    //     //     icon: 'local:menu-icon/graph',
    //     //     sortCode: 2,
    //     //     status: 1,

    //     // },
    //     // {
    //     //     rightId: 6,
    //     //     parentId: 0,
    //     //     rightName: '智能体',
    //     //     rightObject: 'menu',
    //     //     pageUrl: '/agent',
    //     //     description: '',
    //     //     icon: 'local:menu-icon/agent',
    //     //     sortCode: 2,
    //     //     status: 1,

    //     // },
    //     // {
    //     //     rightId: 7,
    //     //     parentId: 0,
    //     //     rightName: '系统管理',
    //     //     rightObject: 'menu',
    //     //     pageUrl: '/system',
    //     //     description: '',
    //     //     icon: 'local:menu-icon/system',
    //     //     sortCode: 2,
    //     //     status: 1,
    //     //     active: true
    //     // },
    // ] as SysRightPo[];
    const { id } = useParams();
    const [currentMenu, setCurrentMenu] = useState('');
    const currentRoute: iRoute = useRouteProps();
    
    // 在组件内
    useEffect(() => {


        const matches = matchRoutes(menuList.map(x => { return { path: x.pageUrl } }), location.pathname);

        if (matches?.length) {
            const matchedMenu = matches[matches.length - 1].route;

            const currMenu = menuList.find((menu) => {
                return menu.pageUrl === matchedMenu.path;
            })

            if (!currMenu) {
                return;
            }

            setCurrentMenu(currMenu.rightId);
        }
        else {
            const activeMenu = menuList.find((menu) => { return menu.pageUrl === currentRoute.activeMenu });
            if (activeMenu) {
                setCurrentMenu(activeMenu.rightId);
            }
        }
    }, [menuList, location.pathname]);
    const clickMenu = (item) => {

        const url = item.pageUrl || '';
        history.push({
            pathname: url.replace(':id', id),
        })
    }

    return (
        <div className='h-full w-52 flex flex-col bg-white dark:bg-[#1B1B1B] p-3 overflow-auto ' >
            {(icon || name) && <>

                <div className='flex-none flex flex-col justify-center items-center'>
                    <div className='h-16 w-16 bg-[var(--ant-color-bg-layout)] rounded-full flex justify-center items-center'>
                        {/* <RiContactsLine className='w-11 h-11 text-primary-500' /> */}
                        {icon && <Icon icon={icon as any} className='w-11 h-11 text-primary-500 flex items-center justify-center' ></Icon>}

                    </div>

                    <div className='text-center text-xl mt-2 text-gray-500 block-ellipsis w-full' title={name}>{name}</div>
                </div>
                <Divider className='!mt-4 h-px' />
            </>}
            {
                menuList && menuList.map((item, index) => {
                    return (
                        <Button onClick={() => { clickMenu(item) }} key={item.rightId}
                            
                            className={cn( styles['mate-submenu-button'],' text-gray-500', (item.rightId == currentMenu ? 'bg-primary-100 text-primary-500' : ''),
                                // item.status === 2 ? 'disabled' : '',
                                'mb-5 pl-5 flex items-center justify-start gap-2 h-11 w-full flex-none   rounded-3xl border-none')}>
                            {item.icon ? <Icon width='20' height='20' icon={item.icon as any} className='w-5 h-5 ' /> : <div className='w-5 h-5'></div>}
                            {item.rightName}
                        </Button>
                    )
                })
            }



        </div >
    );
}

export default SubSidebar;