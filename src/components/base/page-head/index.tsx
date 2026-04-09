import { Link, Outlet, useLocation, Icon } from 'umi';
import styles from './index.less';
import { Breadcrumb, Layout, Menu, theme, Divider, Button } from 'antd';
import { RightOutlined } from "@ant-design/icons";
import React, { FC, useState } from "react";
import { history } from "umi";

// import Icon, { } from "@ant-design/icons";
import { } from "module";


const { Header, Content, Sider } = Layout;

type SidebarProps = {
    pageTitle?: React.ReactNode;
    pageDesc?: React.ReactNode;
    goBack?: any;
};
const PageHead: FC<SidebarProps> = ({ pageTitle, pageDesc, goBack }) => {


    const back = () => {
        if (goBack && typeof goBack === 'function') {
            goBack();
        }
        else {
            history.back();
        }
    }

    return (
        <div className='flex-none mb-8'>
            <div className='flex justify-start items-center text-xl font-semibold'>
                {goBack !== null && <div className='mr-2 cursor-pointer' onClick={back}>
                    <Icon icon='ant-design:left-outlined'></Icon>
                </div>}

                {pageTitle}

            </div>
            {pageDesc &&<div className='mt-1 text-gray-400 text-sm'>
                {pageDesc}
            </div>}
        </div>
    );
}

export default PageHead;