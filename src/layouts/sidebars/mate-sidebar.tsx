import { Link, Outlet, useLocation, Icon, history, NavLink } from 'umi';
import styles from './index.less';
import { Breadcrumb, Layout, Menu, theme, Divider, Button, Dropdown, Form, Modal, Input, App, Space, Avatar } from 'antd';
import { LeftOutlined, PlusOutlined, RightOutlined } from "@ant-design/icons";
import { FC, useEffect, useState } from "react";
import SvgIcon from "@/components/base/svg-icon";
import { useIsDarkTheme, useTheme } from "@/components/base/theme-provider";
import MenuItem from "./menu-item";
import useUserStore from "@/stores/userStore";

import { random } from "lodash";
// import Icon, { } from "@ant-design/icons";
import { } from "module";
import { useSetModalState, useTranslate } from '@/hooks/common-hooks';
import { UserService } from "@/services/user.service";
import { UserPo } from '@/models/userPo';
import userStore from '@/stores/userStore';
import SystemLogo from '@/components/base/system-logo';
import { config } from '@/config';
import { cn } from '@/lib/utils';
const userService = UserService.getInstance();
enum userLevelEnum {
    normal = 0,
    pro = 1,
    ent = 2,
    custom = 3
}

export const FeedbackIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);

const { Header, Content, Sider } = Layout;

type SidebarProps = {
    collapsed: boolean;
    menuList: any[];
    toggleCollapse: () => void;
    currentMenu: any;
    onFeedbackClick: () => void;
};
const Sidebar: FC<SidebarProps> = ({ collapsed, toggleCollapse, menuList, currentMenu, onFeedbackClick }) => {
    const { pathname } = useLocation();
    const { message } = App.useApp();
    const { t } = useTranslate();

    const iconArr = [
        'workflow', 'db', 'gpt-chat', 'graph', 'kb', 'setting', 'system', 'user-line', 'agent'
    ]

    const [icon, setIcon] = useState<any>('local:menu-icon/agent');
    const getIcon = () => {
        const index = random(0, iconArr.length - 1);
        return `local:menu-icon/${iconArr[index]}`;
    }

    const { userInfo, resetAll } = useUserStore();
    useEffect(() => {
        console.log('menuList', menuList)
    }, [menuList])


    const changeIcon = () => {
        setIcon(getIcon())
    }

    const filterVisibleMenus = (items: any[] = []) => {
        return items.filter((item) => !item?.hideInMenu);
    };

    const isPathMatch = (menuUrl?: string, target?: string) => {
        if (!menuUrl || !target) return false;
        return target === menuUrl || target.startsWith(`${menuUrl}/`);
    };

    const findMenuPath = (items: any[], target: string, path: any[] = []): any[] | null => {
        for (const item of items) {
            const nextPath = [...path, item];
            if (item.children?.length) {
                const result = findMenuPath(item.children, target, nextPath);
                if (result) return result;
            }
            if (isPathMatch(item.pageUrl, target)) return nextPath;
        }
        return null;
    };

    const buildRootGroups = () => {
        return filterVisibleMenus(menuList).map((group) => ({
            ...group,
            children: filterVisibleMenus(group.children || []),
        }));
    };

    const [menuStack, setMenuStack] = useState<any[]>([]);

    useEffect(() => {
        const groups = buildRootGroups();
        const rootItems = groups.flatMap((group) => group.children || []);
        const path = findMenuPath(groups, pathname) || [];
        const lastWithChildren = [...path].reverse().find((item) => item.children?.length);
        if (lastWithChildren && lastWithChildren.parentId !== 0) {
            setMenuStack([
                { type: 'root', groups },
                { type: 'sub', parent: lastWithChildren, items: filterVisibleMenus(lastWithChildren.children || []) },
            ]);
        } else {
            setMenuStack([{ type: 'root', groups }]);
        }
    }, [menuList, pathname]);

    const clickMenu = (e: any) => {
        if (e && e.key === 'logout') {
            resetAll()
            return;
        }
        if (!e) return;

        if (!e.pageUrl) {
            message.error('功能暂未开放');
            return;
        }
        if (e.children?.length) {
            setMenuStack((prev) => [
                ...prev,
                { type: 'sub', parent: e, items: filterVisibleMenus(e.children || []) },
            ]);
            // 展开子菜单的同时，导航到 pageUrl
            if (e.pageUrl) {
                history.push(e.pageUrl);
            }
            return;
        }
        if (e.pageUrl) {
            history.push(e.pageUrl);
            return;
        }
        // message.error('功能开发中')
    }


    const [passwordForm] = Form.useForm();

    const themeName = useIsDarkTheme() ? 'dark' : 'light';
    const { theme, setTheme } = useTheme();
    const onDropdownClick = (e: any) => {

        if (e.key === 'logout') {
            resetAll()

        }
        else if (e.key === 'changePassword') {
            passwordForm.resetFields();
            showModal();
        }
        else if (e.key === 'dark') {
            setTheme('dark');
        }
        else if (e.key === 'light') {
            setTheme('light');
        }
        else if (e.key === 'system') {
            setTheme('system');
        }
        // history.push(`/worktable/${e.key}/update`)
    }
    const { userId } = userStore().userInfo;
    const onSavePassowrd = () => {

        passwordForm.validateFields().then((values) => {

            let userinfo = { userId } as UserPo;
            userinfo.password = values.password;
            // userinfo.newPassword = values.newpass;
            // userinfo.newPassword = values.newpass;
            // userService.updateSelfPassword(userinfo).subscribe((res) => {
            //     message.success("密码修改成功");
            //     hideModal();
            // });
            // userService.updateSelfPassword(values).subscribe((res: any) => {
            //     message.success('修改成功')
            //     hideModal();
            // })
        })

    }
    let checkPassword = async (_rule: any, value: string) => {
        const detail = passwordForm.getFieldsValue();

        if (!value) {
            return Promise.reject("请再次输入新密码");
        }
        if (value === detail.password) {
            return Promise.reject("新旧密码不能相同");
        }
        if (value !== detail.newpass) {
            return Promise.reject("两次输入密码不一致");
        } else {
            return Promise.resolve();
        }
    };
    const updateRules = {
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
        newpass: [{ required: true, message: "请输入新密码", trigger: "blur" }, {}],
        newpass2: [{ required: true, validator: checkPassword, trigger: "blur" }],
    };

    const isLogin = !!userInfo.userId;

    const appConf = config;


    const { visible, hideModal, showModal } = useSetModalState();

    const activeMatch = (item: any): boolean => {
        if (!item) return false;
        if (isPathMatch(item.pageUrl, pathname)) return true;
        if (item.children?.length) {
            return item.children.some((child: any) => activeMatch(child));
        }
        return false;
    };

    const currentLayer = menuStack[menuStack.length - 1];
    const rootGroups = currentLayer?.type === 'root' ? currentLayer.groups : null;
    const visibleRootGroups = rootGroups ? rootGroups.filter((group: any) => group.children?.length) : [];
    const subItems = currentLayer?.type === 'sub' ? currentLayer.items : null;
    const showBack = menuStack.length > 1;
    const handleBack = () => {
        setMenuStack((prev) => prev.slice(0, -1));
        // 返回主菜单时导航到新建PPT页面
        if (menuStack.length <= 2) {
            history.push('/ppt/new');
        }
    };





    return (
        <Sider collapsible width={185} trigger={null} style={{
            borderRadius: "20px",
            background: "linear-gradient(176.00deg, rgba(242, 248, 252, 1),rgba(236, 229, 253, 1) 50%,rgba(239, 246, 253, 1) 100%)"
        }}>

            <div className='h-full flex flex-col '>
                <div className='flex-none flex justify-center items-center gap-2 cursor-pointer relative' onClick={() => { history.push('/') }}>

                    <Space size={12}>
                        {showBack && (
                            <div className='absolute left-1 top-1/2 transform -translate-y-1/2'>
                                <Button
                                    type="text"
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleBack();
                                    }}
                                    icon={<LeftOutlined />}
                                />

                            </div>
                        )}
                        <SystemLogo size={56} />
                        <span
                            className='text-xl font-bold'
                        >
                            {appConf.appName}
                        </span>
                    </Space>

                </div>

                {/* <div className='flex-none flex justify-center items-center gap-2 p-3'>
                    <Button type="primary" className='rounded-full' block onClick={() => {
                        history.push('/ppt/new');
                    }}>
                        <PlusOutlined />
                        新建PPT
                    </Button>
                </div> */}

                <div className='flex-1 overflow-auto flex flex-col items-center justify-between pt-5 gap-5 '>

                    <div className='flex flex-col items-center justify-start gap-4 w-full'>
                        {visibleRootGroups.map((group: any, groupIndex: number) => {
                            return (
                                <div key={group.rightId} className="flex flex-col items-center justify-start gap-4 px-1 w-full">
                                    {group.children.map((item: any) => (
                                        item.custom ? (
                                            <div key={item.rightId} className='flex-none flex justify-center items-center gap-2 px-2 w-full'>
                                                <MenuItem
                                                    active={activeMatch(item)}
                                                    collapsed={collapsed}
                                                    item={item}
                                                    name={t(item.i18nKey)}
                                                    onClick={() => {
                                                        history.push(item.pageUrl);
                                                    }}
                                                    icon={item.icon ? <>
                                                        {
                                                            item.icon.startsWith('fa') ? <i className={item.icon} /> : <Icon icon={item.icon as any} width='18' height='18' />
                                                        }

                                                    </> : null}
                                                    className={cn('rounded-full ', styles['custom-color-button'])}
                                                    style={{ background: item.custom.color }}
                                                />
                                            </div>
                                        ) : (
                                            <div key={item.rightId} className='flex-none flex justify-center items-center gap-2 px-2 w-full'>

                                                <MenuItem
                                                    active={activeMatch(item)}
                                                    collapsed={collapsed}
                                                    // key={item.rightId}
                                                    item={item}
                                                    name={t(item.i18nKey)}
                                                    onClick={clickMenu}
                                                    icon={item.icon ? <>
                                                        {
                                                            item.icon.startsWith('fa') ? <i className={item.icon} /> : <Icon icon={item.icon as any} width='18' height='18' />
                                                        }

                                                    </> : null}
                                                />
                                            </div>
                                        )
                                    ))}
                                    {groupIndex < visibleRootGroups.length - 1 && <Divider className='!my-2' />}
                                </div>
                            );
                        })}
                        {subItems && subItems.map((item: any) => (
                            item.custom ? (
                                <div key={item.rightId} className='flex-none flex justify-center items-center gap-2 px-2 w-full'>
                                    <MenuItem
                                        active={activeMatch(item)}
                                        collapsed={collapsed}
                                        item={item}
                                        name={t(item.i18nKey)}
                                        onClick={() => {
                                            history.push(item.pageUrl);
                                        }}
                                        icon={item.icon ? <>
                                            {
                                                item.icon.startsWith('fa') ? <i className={item.icon} /> : <Icon icon={item.icon as any} width='18' height='18' />
                                            }

                                        </> : null}
                                        className={cn('rounded-full ', styles['custom-color-button'])}
                                        style={{ background: item.custom.color }}
                                    />
                                </div>
                            ) : (
                                <div key={item.rightId} className='flex-none flex justify-center items-center gap-2 px-2 w-full'>
                                    <MenuItem
                                        active={activeMatch(item)}
                                        collapsed={collapsed}
                                        key={item.rightId}
                                        item={item}
                                        name={t(item.i18nKey)}
                                        onClick={clickMenu}
                                        icon={item.icon ? <>
                                            {
                                                item.icon.startsWith('fa') ? <i className={item.icon} /> : <Icon icon={item.icon as any} width='18' height='18' />
                                            }

                                        </> : null}
                                    />
                                </div>
                            )
                        ))}

                    </div>

                    <div className='mt-5 flex-none overflow-auto flex flex-col items-center justify-start  gap-2 w-full'>



                        {/* <div className=' flex items-center justify-center gap-3'>
                            <span className='text-textcolor-400'>
                                {t('common.userProfile.userLevels' + '.' + userInfo.levelId)}

                            </span>

                            {!userInfo.levelId && <span className='text-orange-500 cursor-pointer'>
                                {t('common.userProfile.upgradeUserLevel')}
                            </span>}
                        </div> */}

                        <div className='px-1'>

                            <button
                                onClick={onFeedbackClick}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-indigo-600 hover:bg-white rounded-lg transition-all mt-4 border border-indigo-100 group"
                            >
                                <div className="w-8 h-8 bg-indigo-50 rounded-md flex items-center justify-center group-hover:bg-indigo-100">
                                    <FeedbackIcon className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-sm font-semibold">意见反馈</span>
                                    <span className="text-[10px] text-indigo-400">联系我们 & 问题反馈</span>
                                </div>
                            </button>
                        </div>
                        <div className='w-full pl-2 mt-3'>
                            {isLogin && <MenuItem key="logout" active={false} collapsed={collapsed} item={{}} name={t('common.userProfile.logout')} onClick={() => clickMenu({ key: 'logout' })} icon={
                                <Icon icon={'local:icon-exit'} width='16' height='16' />

                            } >
                            </MenuItem>}
                        </div>


                        <div className='h-16 flex items-center gap-2 w-full overflow-hidden px-2 border-t'>
                            {isLogin ? <>


                                <div className='flex-none'>


                                    {
                                        userInfo.avatarUrl ? (
                                            <Avatar size={28} src={userInfo.avatarUrl} />
                                        ) : (
                                            <Avatar
                                                size={28}
                                                style={{ backgroundColor: 'rgb(106, 94, 245)', color: '#fff' }}
                                            >
                                                {userInfo.userName ? userInfo.userName.charAt(0).toUpperCase() : ''}
                                            </Avatar>
                                        )
                                    }
                                </div>

                                <div className='flex-1 truncate'>
                                    <span className='text-base  text-black' title={userInfo.userName}>{userInfo.userName}</span>

                                </div>
                            </> :
                                <MenuItem active={false} collapsed={collapsed} item={{}} name={t('common.userProfile.login')} onClick={() => {
                                    history.push('/login')
                                }} icon={
                                    <Icon icon={'local:menu-icon/exit'} width='22' height='22' />

                                } >
                                </MenuItem>


                            }
                        </div>



                    </div>
                </div>
            </div>

            <Modal title="修改密码" open={visible} onOk={() => { onSavePassowrd() }} onCancel={() => { hideModal() }}>
                <Divider className='!my-4 h-px'></Divider>
                <Form form={passwordForm} labelCol={{ span: 5 }} wrapperCol={{ span: 15 }}>
                    <Form.Item label='旧密码' name='password' rules={updateRules.password}>
                        <Input />
                    </Form.Item>
                    <Form.Item label='新密码' name='newpass' rules={updateRules.newpass}>
                        <Input />
                    </Form.Item>
                    <Form.Item label='确认密码' name='newpass2' rules={updateRules.newpass2}>
                        <Input />
                    </Form.Item>
                </Form>


            </Modal>
        </Sider>
    );
}

export default Sidebar;
