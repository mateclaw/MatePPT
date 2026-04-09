import React from 'react';
import { Button, Input, Form, Checkbox, App } from "antd";
import type { FormProps } from 'antd';
import type { UserPo } from "@/models/userPo";
import { UserPoRule } from "@/models/rules/userPo.rule";
import { RiPencilRuler2Line, RiFingerprintLine, RiMagicLine } from "@remixicon/react";
import { history } from 'umi'
import { useTranslate } from "@/hooks/common-hooks";
type FieldType = {
    username?: string;
    password?: string;
    remember?: string;
};
import { UserService } from "@/services/user.service";
import useUserStore from "@/stores/userStore";
import { Import } from 'lucide-react';
import styles from "./login.less";
// import { ReactComponent as LoginBg } from "@/assets/mateai/login-apiary.svg";
import cn from "@/utils/classnames";
import useSystemStore from "@/stores/systemStore";
import { useMenus } from "@/hooks/menu-hooks";
import SystemLogo from '@/components/base/system-logo';
import LoginForm from "@/components/base/login-form";

const LoginPage = () => {
    const userService = UserService.getInstance();
    const { setUserInfo, setAccessToken } = useUserStore();
    const { message } = App.useApp();

    const { t } = useTranslate();
    const { appName } = useSystemStore();
    const ms = () => {
        message.success(t('login.logged'));
    }

    const login = async (user: UserPo) => {
        return new Promise((resolve, reject) => {
            userService.accountLogin(user).subscribe({
                next: res => {
                    const resData = res.data as UserPo;
                    setUserInfo(resData);
                    setAccessToken(resData.token);
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
            ms();
            // await fetchAllMenus();
            // await fetchUserMenus();
            history.push('/')

        })
    };

    const onFinishFailed: FormProps<UserPo>['onFinishFailed'] = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    return (
        <div className={styles['login-page']}>

            <LoginForm className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-24px)] md:w-auto max-w-[1246px]'/>



        </div>
    );
};

export default LoginPage;
