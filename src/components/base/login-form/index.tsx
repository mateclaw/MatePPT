
import type { FC } from 'react'
import React, { useCallback, useEffect, useState } from 'react'
// import Slider from '@/components/base/slider'
import { Slider, InputNumber, Avatar, Form, Input, FormProps, App, Button, Typography, Tabs, Space } from "antd";
import { useTranslate } from "@/hooks/common-hooks";
import { cn } from '@/lib/utils';
import LoginBg from "@/assets/mateai/login-bg.webp";
import SystemLogo from "@/components/base/system-logo";
import { UserPo } from '@/models/userPo';
import useSystemStore from '@/stores/systemStore';
import { UserService } from '@/services/user.service';
import useUserStore from '@/stores/userStore';
import { Icon, Link, history } from 'umi';
import { OtpCodePo } from '@/models/otpCodePo';
import { redirectToOAuthProvider, clearOAuthStorage } from '@/utils/oauth';
import type { WxLoginConfig } from '@/types/wx.d';
import { getWechatOAuthConfig, generateState } from "@/utils/oauth";
import { config } from '@/config';

type Props = {
    className?: string,
    size?: number,
    isPlain?: boolean
}

const userService = UserService.getInstance();
const LoginForm: FC<Props> = (props) => {

    const { Title, Text } = Typography;

    const { t } = useTranslate();
    const { message } = App.useApp();
    const { setUserInfo, setAccessToken } = useUserStore();
    const { appName } = useSystemStore();
    const onSuccess = () => {
        message.success(t('login.logged'));
    }

    const [activeKey, setActiveKey] = useState('username');

    const [userNameForm] = Form.useForm();
    const [mobileForm] = Form.useForm();
    const [smsLoading, setSmsLoading] = useState(false);
    const [smsCountdown, setSmsCountdown] = useState(0);
    const [demoLoading, setDemoLoading] = useState(false);

    const applyLoginResult = (resData: UserPo) => {
        setUserInfo(resData);
        setAccessToken(resData.token);
    };

    const initWxLogin = () => {
        if (typeof window !== 'undefined' && window.WxLogin) {
            const container = document.getElementById('wx-login_container');
            // 容器必须存在且为空，才能初始化
            if (container && container.children.length === 0) {
                const wxconfig = getWechatOAuthConfig();
                const wxLoginConfig: WxLoginConfig = {
                    self_redirect: false,
                    id: "wx-login_container",
                    appid: "wx041cc5027104c5ef",
                    scope: "snsapi_login",
                    redirect_uri: wxconfig.redirectUri || `${window.location.origin}/oauth/wechat/callback`,
                    state: generateState(),
                    style: "",
                    href: "",
                    onReady: (isReady) => {
                        console.log('WxLogin ready:', isReady);
                    },

                    ...wxconfig
                };
                console.log('WxLogin config:', wxLoginConfig);
                console.log('wxconfig:', wxconfig);
                try {
                    new window.WxLogin(wxLoginConfig);
                } catch (error) {
                    console.error('WxLogin initialization error:', error);
                    clearOAuthStorage();
                }
            }
        }
    };

    // 初始化微信登录
    useEffect(() => {
        if (activeKey === 'wechat') {
            // 延迟初始化，确保DOM已渲染
            const timer = setTimeout(() => {
                initWxLogin();
            }, 100);
            return () => clearTimeout(timer);
        } else if (activeKey !== 'wechat') {
            // 切换不是微信登录时，需要清理 sessionStorage 中的 oauth state
            // 并且清空 wx-login_container 的网页内容（下次再切换回微信区域时会重新渲染）
            clearOAuthStorage();
            const container = document.getElementById('wx-login_container');
            if (container) {
                container.innerHTML = '';
            }
        }
    }, [activeKey]);

    useEffect(() => {
        if (!smsCountdown) return;
        const timer = setTimeout(() => setSmsCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [smsCountdown]);

    const tryDemoLogin = useCallback(async () => {
        if (!config.demoAutoLogin || !config.demoSessionUrl) {
            return false;
        }

        setDemoLoading(true);
        try {
            const response = await fetch(config.demoSessionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    source: 'github-pages',
                }),
            });

            const payload = await response.json();
            const resData = payload?.data?.userInfo
                ? { ...payload.data.userInfo, token: payload.data.token }
                : payload?.data?.token
                    ? payload.data
                    : payload?.token
                        ? payload
                        : null;

            if (!response.ok || !resData?.token) {
                throw new Error(payload?.msg || 'Demo login failed');
            }

            applyLoginResult(resData as UserPo);
            history.push('/');
            return true;
        } catch (error) {
            console.error('[LoginForm] Demo login error:', error);
            return false;
        } finally {
            setDemoLoading(false);
        }
    }, [setAccessToken, setUserInfo]);

    useEffect(() => {
        const hasSession = !!useUserStore.getState().accessToken && !!useUserStore.getState().userInfo?.userId;
        if (hasSession) {
            return;
        }
        void tryDemoLogin();
    }, [tryDemoLogin]);

    const login = async (user: UserPo) => {
        return new Promise((resolve, reject) => {
            userService.accountLogin(user).subscribe({
                next: res => {
                    const resData = res.data as UserPo;
                    applyLoginResult(resData);
                    resolve(resData);
                },
                error: err => {
                    reject(err);
                },
            })

        })

    }
    const onFinish: FormProps<UserPo>['onFinish'] = async (values) => {

        login(values as UserPo).then(async res => {
            onSuccess();
            // await fetchAllMenus();
            // await fetchUserMenus();
            history.push('/')

        })
    };

    const smsLogin = async (user: UserPo) => {
        return new Promise((resolve, reject) => {
            userService.smsLogin(user).subscribe({
                next: res => {
                    const resData = res.data as UserPo;
                    applyLoginResult(resData);
                    resolve(resData);
                },
                error: err => reject(err),
            });
        });
    };

    const onSmsFinish: FormProps<UserPo>['onFinish'] = async (values) => {
        smsLogin(values as UserPo).then(async res => {
            onSuccess();
            history.push('/');
        });
    };

    const sendSmsCode = async () => {
        const mobile = mobileForm.getFieldValue('mobile');
        if (!mobile) {
            message.warning('请输入手机号');
            return;
        }
        console.log('Sending SMS code to', mobile);
        setSmsLoading(true);
        const payload: OtpCodePo = {
            channel: 'sms',
            receiver: mobile,
            purpose: 'login',
        } as any;
        userService.sendMobileCheckCode(payload).subscribe({
            next: () => {
                message.success('验证码已发送');
                setSmsLoading(false);
                setSmsCountdown(60);
            },
            error: (err) => {
                setSmsLoading(false);
                setSmsCountdown(60);
                console.error(err);
            },

        });
    };

    const toGoogle = useCallback(() => {
        try {
            redirectToOAuthProvider('google');
        } catch (error) {
            console.error('[LoginForm] Google OAuth error:', error);
            message.error('Google 登录初始化失败，请稍后重试');
        }
    }, [message])

    const toWechat = useCallback(() => {
        try {
            redirectToOAuthProvider('wechat');
        } catch (error) {
            console.error('[LoginForm] WeChat OAuth error:', error);
            message.error('微信登录初始化失败，请稍后重试');
        }
    }, [message])

    const toGithub = useCallback(() => {
        try {
            redirectToOAuthProvider('github');
        } catch (error) {
            console.error('[LoginForm] GitHub OAuth error:', error);
            message.error('GitHub 登录初始化失败，请稍后重试');
        }
    }, [message])

    const onFinishFailed: FormProps<UserPo>['onFinishFailed'] = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    return (
        <div className={cn('login-form flex', props.className)}>
            <div className='left-panel w-full md:w-[623px] h-auto md:h-[709px] relative px-5 md:px-[80px] py-10 md:py-[85px] bg-white rounded-xl md:rounded-l-xl md:rounded-r-none overflow-hidden'>
                <Title className='text-center'>
                    欢迎使用{appName}PPT
                </Title>

                {config.demoAutoLogin && (
                    <div className='mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700'>
                        {demoLoading ? '演示账号自动登录中...' : '当前站点已开启演示账号自动登录。'}
                    </div>
                )}

                <Tabs className='mate-tabs' defaultActiveKey="username" activeKey={activeKey} onChange={(key) => setActiveKey(key)} centered items={[

                    {
                        label: '微信扫码',
                        key: 'wechat',
                        children: <div className='flex flex-col'>
                            <div id="wx-login_container" className='flex items-center justify-center'></div>
                        </div>
                    },
                    {
                        label: '手机验证码',
                        key: 'mobile',
                        children: <div className='flex flex-col px-4 md:p-[56px] pt-3'>
                            <Form
                                name="mobileForm"
                                labelCol={{ span: 4, offset: 2 }}
                                wrapperCol={{ span: 24 }}
                                form={mobileForm}
                                style={{ maxWidth: 600 }}
                                initialValues={{ remember: true }}
                                onFinish={onSmsFinish}
                                onFinishFailed={onFinishFailed}
                                autoComplete="off"
                            // variant='borderless'
                            // labelAlign='left'
                            >

                                <Form.Item<UserPo> className=''
                                    // label={t('login.name')}

                                    name="mobile"
                                    rootClassName='w-full'
                                    rules={[{ required: true, message: '请输入手机号' }]}
                                >
                                    <Input placeholder={
                                        '请输入手机号'
                                    } size='large' />
                                </Form.Item>



                                <Form.Item<UserPo> className=''
                                    // label={t('login.password')}
                                    name="checkCode"
                                    rules={[{ required: true, message: '请输入验证码' }]}
                                >
                                    <Space.Compact style={{ width: '100%' }}>
                                        <Input placeholder="验证码" size='large' />
                                        <Button
                                            size="large"
                                            onClick={sendSmsCode}
                                            disabled={!!smsCountdown}
                                            loading={smsLoading}
                                        >
                                            {smsCountdown ? `${smsCountdown}s` : '获取验证码'}
                                        </Button>
                                    </Space.Compact>
                                </Form.Item>



                                <Button type="primary" size='large' className='' block onClick={() => mobileForm.submit()}>
                                    短信登录
                                </Button>

                            </Form>
                        </div>
                    },
                    {
                        label: '用户名密码',
                        key: 'username',
                        children: <div className='flex flex-col px-4 md:p-[56px] pt-3'>
                            <Form
                                name="userNameForm"
                                labelCol={{ span: 4, offset: 2 }}
                                wrapperCol={{ span: 24 }}
                                form={userNameForm}
                                style={{ maxWidth: 600 }}
                                initialValues={{ remember: true }}
                                onFinish={onFinish}
                                onFinishFailed={onFinishFailed}
                                autoComplete="off"
                            // variant='borderless'
                            // labelAlign='left'
                            >

                                <Form.Item<any> className=''
                                    // label={t('login.name')}

                                    name="email"
                                    rootClassName='w-full'
                                    rules={[{ required: true, message: 'Please input your email!' }]}
                                >
                                    <Input placeholder={
                                        t('login.name')
                                    } size='large' />
                                </Form.Item>



                                <Form.Item<UserPo> className=''
                                    // label={t('login.password')}
                                    name="password"
                                    rules={[{ required: true, message: 'Please input your password!' }]}
                                >
                                    <Input.Password placeholder={
                                        t('login.password')
                                    } size='large' visibilityToggle={false} />
                                </Form.Item>



                            </Form>


                            < div className='flex'>
                                <Button
                                    block
                                    size="large"
                                    onClick={toGoogle}
                                    type='link'

                                    // style={{ height: '20px' }}
                                    className='mb-9 h-5'
                                >
                                    <div className='flex items-center  text-sm text-black' >
                                        <Icon
                                            icon="local:google"
                                            style={{ verticalAlign: 'middle', marginRight: 5 }}
                                        />
                                        Sign in with Google
                                    </div>
                                </Button>

                                <Button
                                    block
                                    size="large"
                                    onClick={toGithub}
                                    type='link'
                                    // style={{ height: '20px' }}
                                    className='mb-9 h-5'
                                >
                                    <div className="flex items-center text-sm text-black">
                                        <Icon
                                            icon="local:github"
                                            style={{ verticalAlign: 'middle', marginRight: 5 }}
                                        />
                                        Sign in with Github
                                    </div>
                                </Button>

                            </div>

                            <div className=''>
                                <Button type="primary" size='large' className='' block onClick={() => {
                                    userNameForm.submit();
                                }}>
                                    {t('login.signBtn')}
                                </Button>
                            </div>
                        </div>
                    },
                ]}
                />

                <div className='text-black text-center text-xs'>
                    登录即表示您同意我们的

                    <Link target='_blank' to="/help/agreement" className="hover:text-brand-600 transition-colors">用户协议</Link>

                    和
                    <Link target='_blank' to="/help/privacy" className="hover:text-brand-600 transition-colors">隐私政策</Link>
                </div>

            </div>
            <div className='right-panel hidden md:block w-[623px] h-[709px] relative rounded-r-xl overflow-hidden'>
                <img src={LoginBg} className='login-bg select-none w-full h-full absolute top-0 left-0 ' />
                <div className='relative z-10 '>

                    <div className='mt-[165px] text-white mx-auto text-5xl font-bold w-[350px]'>
                        <SystemLogo size={85} className='' />
                        Mate AI
                    </div>

                    <div className='text-white mx-auto text-5xl font-bold  w-[350px]'>
                        AI一键生成PPT
                    </div>
                </div>


            </div>

        </div>
    )
}
export default React.memo(LoginForm)
