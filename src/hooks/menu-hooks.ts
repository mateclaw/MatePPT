// hooks/useMenus.ts
import { useCallback, useEffect } from 'react';
import useAuthStore from '@/stores/authStore';
import useUserStore from "@/stores/userStore";
// import { SysRightService } from "@/services/sysRight.service";
import { SysRightPo } from '@/models/sysRightPo';
import { listToTree } from '@/utils/common-util';
import { frontendMenus, getAllMenus } from "@/config/menus";

const isLocalMenu = true;
export const useMenus = () => {
    const authStore = useAuthStore();

    const userInfo = useUserStore(state => state.userInfo);
    // const sysRightService = SysRightService.getInstance();

    const fetchAllMenus = useCallback(async () => {
        if (isLocalMenu) {
            // 本地菜单已是树形结构，直接使用
            const totalMenuList = getAllMenus() as SysRightPo[];
        
            const totalActionList: SysRightPo[] = [];
            authStore.setTotalMenuList(totalMenuList);
            authStore.setTotalRightList(totalMenuList);
            authStore.setTotalActionList(totalActionList);
            authStore.setTotalMenuTree(frontendMenus as SysRightPo[]);

        }
        // else {
        //     sysRightService.all({} as SysRightPo).subscribe({
        //         next: (res) => {
        //             const totalRightList: SysRightPo[] = res.data || [];
        //             const totalMenuList = totalRightList.filter(item => item.rightObject === 'menu');
        //             const totalActionList = totalRightList.filter(item => item.rightObject === 'action');
        //             const tree = listToTree<SysRightPo>(totalMenuList, { idKey: 'rightId', parentIdKey: 'parentId', sortOrder: 'asc', sortKey: 'sortCode' });
        //             authStore.setTotalRightList(totalRightList);
        //             authStore.setTotalMenuList(totalMenuList);
        //             authStore.setTotalActionList(totalActionList);
        //             // setUserMenuList(res.data.filter(item => item.status === 1));
        //             authStore.setTotalMenuTree(tree);
        //         },
        //         error: (err) => {
        //             authStore.setTotalMenuList([]);
        //             console.log(err);
        //         }
        //     });
        // }
    }, [userInfo, authStore]);

    const fetchUserMenus = useCallback(async () => {
        if (isLocalMenu) {
            // 本地菜单已是树形结构，直接使用
            const userMenuList = getAllMenus() as SysRightPo[];
            const userActionList: SysRightPo[] = [];
            authStore.setUserActionList(userActionList);
            authStore.setUserMenuList(userMenuList);
            authStore.setUserMenuTree(frontendMenus as SysRightPo[]);
            authStore.setIsLoaded(true);
        }
        // else {
        //     sysRightService.myRights({
        //         // roleId: userInfo.userRole,
        //         userId: userInfo.userId
        //         // status: 1
        //     } as SysRightPo).subscribe({
        //         next: (res) => {
        //             const totalUserRightList: SysRightPo[] = res.data || [];
        //             const userMenuList = totalUserRightList.filter(item => item.rightObject === 'menu');
        //             const userActionList = totalUserRightList.filter(item => item.rightObject === 'action');
        //             const tree = listToTree<SysRightPo>(userMenuList, { idKey: 'rightId', parentIdKey: 'parentId', sortOrder: 'asc', sortKey: 'sortCode' });
        //             authStore.setUserRightList(totalUserRightList);
        //             authStore.setUserActionList(userActionList);
        //             authStore.setUserMenuList(userMenuList);
        //             authStore.setUserMenuTree(tree);
        //             authStore.setIsLoaded(true);
        //         },
        //         error: (err) => {
        //             authStore.setUserMenuList([]);
        //         }
        //     });
        // }
    }, [userInfo, authStore])

    useEffect(() => {

        
        if (isLocalMenu ||  userInfo && userInfo.token) {
            fetchAllMenus();
            fetchUserMenus();
        }




    }, [userInfo]);

    return { fetchAllMenus, fetchUserMenus };
};
