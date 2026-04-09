import useAuthStore from '@/stores/authStore';
import useUserStore from "@/stores/userStore";
import { useEffect, useLayoutEffect } from 'react';
import { matchRoutes, Navigate, Outlet, useRouteProps, useLocation } from 'umi';
import Error404 from "@/pages/404";
import Error403 from "@/pages/403";
import { iRoute } from '@/types/base';
import useSystemStore from '@/stores/systemStore';
import Loading from '@/loading';

const checkStatus = false;
export default (props) => {
    //   const { isLogin } = useAuth();


    const authStore = useAuthStore();
    const userStore = useUserStore();
    const systemStore = useSystemStore();
    const isLoadded = authStore.isLoaded;
    const isLogin = userStore.userInfo && userStore.userInfo.userId && userStore.accessToken;
    // if (!isLogin) {
    //     return <Navigate to="/login" />;
    // }

    const location = useLocation();
    const matches = matchRoutes(authStore.userRightList.map(x => { return { path: x.pageUrl } }), location.pathname);
    const currentRoute: iRoute = useRouteProps();

    if(!isLogin){
        return <Navigate to="/login" />;
    }

    // useLayoutEffect(() => {
    //     // 在组件内
    //     systemStore.setSubmenuIcon('');
    //     systemStore.setSubmenuName('');
    // }, [location.pathname]);
    if (matches?.length) {
        const matchedMenu = matches[matches.length - 1].route;

        const currMenu = authStore.userRightList.find((menu) => {

            return menu.pageUrl === matchedMenu.path;

        })

        if (!isLoadded) {
            return <Loading />
        }
        if (!currMenu) {
            return <Error404 />;
        }
        if(checkStatus && currMenu.status === 2){
            return <Error403 />;
        }

    }
    else {

        // const activeMenu = authStore.userRightList.find((menu) => { return menu.pageUrl === currentRoute.activeMenu && (checkStatus ? menu.status === 1 : true) });
        const activeMenu = authStore.userRightList.find((menu) => { return menu.pageUrl === currentRoute.activeMenu });
        if (!isLoadded) {
            return <Loading />;
        }
        if (!activeMenu)
            return <Error404 />;

        if(checkStatus && activeMenu.status === 2){
            return <Error403 />;
        }
    }





    if (isLogin) {
        return <Outlet />;
    } else {
        return <Navigate to="/login" />;
    }
}