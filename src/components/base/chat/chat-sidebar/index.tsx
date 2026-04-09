import { Icon, Link, Outlet, useLocation, history } from 'umi';
import styles from './index.less';
import { Breadcrumb, Layout, Menu, theme, Divider, Button, Space, GetProp } from 'antd';

import { CommentOutlined, DeleteOutlined, EditOutlined, RightOutlined, StopOutlined } from "@ant-design/icons";
import React, { FC, PropsWithChildren, Component, useEffect } from "react";
import SvgIcon from "@/components/base/svg-icon";
import { useIsDarkTheme } from "@/components/base/theme-provider";
import cn from "@/utils/classnames";
import { RiContactsLine } from "@remixicon/react";
import { GptChatSessionPo } from '@/models/gptChatSessionPo';
import { PlusOutlined } from "@ant-design/icons";
import { GptChatSessionService } from "@/services/gptChatSession.service";
import { useQuery } from '@tanstack/react-query';
import { lastValueFrom } from "rxjs";
import useUserStore from "@/stores/userStore";
import { Conversations, ConversationsProps } from '@ant-design/x';
import dayjs from "dayjs";
const { Header, Content, Sider } = Layout;

type ConversationItemProps = {
    // icon: React.ReactNode;
    // name: string;
    // active?: boolean;
    // children?: React.ReactNode;
    // className?: string;
    // collapsed?: boolean;
    // item?: any;
    // onClick?: (e) => void;
    // menuList: any[];
    // toggleCollapse: () => void;
    currentItem?: GptChatSessionPo;
    itemList?: GptChatSessionPo[];
    onActiveChange?: (key: string) => void;
    onItemActionClick?: (item: GptChatSessionPo, key: string) => void;
    onAddButtonClick?: () => void;
};

const today = dayjs().format('YYYY-MM-DD');
const ConversationSidebar: FC<PropsWithChildren<ConversationItemProps>> = ({ children,  onItemActionClick: onItemClick, itemList, currentItem, onActiveChange ,onAddButtonClick}) => {
    const { token } = theme.useToken();


    const items: GetProp<ConversationsProps, 'items'> = itemList.map((session, index) => {


        const day = dayjs(session.createTime);
        const dayStr = day.format('YYYY-MM-DD');
        return {

            key: `${session.sessionId}`,
            label: `${session.sessionName}`,
            timestamp: day.unix(),
            // icon: <CommentOutlined />,
            disabled: false,
            group: dayStr === today ? '今天' : dayStr,
            title: `${session.sessionName}`
        };
    });

    const isActive = (item) => {
        if (!item || !currentItem) return false;
        return item.sessionId == currentItem?.sessionId;
    }

    const getItemByKey = (key) => {
        return itemList.find((item) => item.sessionId === key);
    }

    const style = {
        width: '100%',

        background: token.colorBgElevated,
        borderRadius: token.borderRadius,
    };
    const groupable: GetProp<typeof Conversations, 'groupable'> = {
        sort(a, b) {


            if (a === b) return 0;
            if (a === today) return -1;

            return a > b ? -1 : 1;
        },
        title: (group, { components: { GroupTitle } }) =>
            group ? (
                <div>
                    <GroupTitle>{group}</GroupTitle>
                </div>
                // <GroupTitle >
                //     <Space>
                //         <span>{group}</span>
                //     </Space>
                // </GroupTitle>
            ) : (
                <GroupTitle />
            ),
    };

    const menuConfig: ConversationsProps['menu'] = (conversation) => ({
        items: [
            {
                label: '修改名称',
                key: 'editName',
                icon: <EditOutlined />,
            },
            {
                label: '修改角色',
                key: 'editRole',
                icon: <EditOutlined />,
                // disabled: true,
            },
            {
                label: '删除对话',
                key: 'delete',
                icon: <DeleteOutlined />,
                danger: true,
            },
        ],
        onClick: (menuInfo) => {
            //   message.info(`Click ${conversation.key} - ${menuInfo.key}`);
            // const currentItem = getItemByKey(menuInfo.key);

            menuInfo.domEvent.stopPropagation();

            const theItem = getItemByKey(conversation.key);
            onItemClick && onItemClick(theItem, menuInfo.key);
        },
    });

    const onSessionChange = (key) => {

        onActiveChange && onActiveChange(key);
    }

    return (
        <div className='h-full w-64 flex flex-col bg-white dark:bg-[#1B1B1B] p-2 overflow-auto ' >

            <Button type='text'  className='h-8 mt-2 flex-none text-left justify-start hover:!bg-primary-150 hover:!text-primary' onClick={()=>{
                onAddButtonClick && onAddButtonClick();
            }}>
                <PlusOutlined className='text-lg'/>新建对话
            </Button>

            {/* {
                itemList && itemList.map((item, index) => {
                    return (
                        <div onClick={() => { clickMenu(item) }} key={index} className={cn('text-gray-500', (isActive(item) ? ' text-primary-500' : ''), 'bg-primary-100 mb-5 pl-5 flex items-center justify-start gap-2 h-11 w-full  hover:text-white hover:bg-primary-200  rounded-3xl cursor-pointer')}>
                            
                            {item.sessionName}
                        </div>
                    )
                })
            } */}

            <Conversations onActiveChange={onSessionChange} style={style} styles={{ item: {
                padding:10
            } }} className='mt-5 p-1' classNames={{
                item: 'conversation-item',
            }} groupable={groupable} activeKey={currentItem ? currentItem.sessionId : ''} items={items} menu={menuConfig} />



        </div >
    );
}

export default ConversationSidebar;