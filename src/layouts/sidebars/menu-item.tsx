import { Link, Outlet, useLocation } from 'umi';
import styles from './index.less';
import { Breadcrumb, Layout, Menu, theme, Divider, Button } from 'antd';

import { RightOutlined } from "@ant-design/icons";
import React, { FC, PropsWithChildren, Component } from "react";
import SvgIcon from "@/components/base/svg-icon";
import { useIsDarkTheme } from "@/components/base/theme-provider";
import cn from "@/utils/classnames";

const { Header, Content, Sider } = Layout;

type MenuItemProps = {
    icon: React.ReactNode;
    name: string;
    active?: boolean;
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    collapsed?: boolean;
    item?: any;
    onClick?: (e) => void;
    // menuList: any[];
    // toggleCollapse: () => void;
};
const MenuItem: FC<PropsWithChildren<MenuItemProps>> = (props) => {
    const { icon, name, children, collapsed, className, style, active, onClick, item } = props;
    


    return (
        <button
            className={cn(styles['top-menu-item'], active ? styles.actived : '', className, 'group/topmenu')}
            style={style}
            title={name}
            onClick={onClick ? (e) => onClick(item) : null}
        >

            <div className={cn(styles['top-menu-icon'])}>
                {icon}

            </div>

            {collapsed ?
                < div className='text-xs  min-h-1 ' >
                </div> : < div className={cn( styles['top-menu-name'],' min-h-3  block-ellipsis w-full text-left')} >
                    {name}

                </div>}

        </button >
    );
}

export default MenuItem;
