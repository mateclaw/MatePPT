/**
 * 前端菜单配置
 * 数据结构参考 SysRightPo，支持多语言
 */

import { SysRightPo } from "@/models/sysRightPo";

export interface MenuItemWithChildren extends Partial<SysRightPo> {
  rightId: number;
  parentId: number;
  rightName: string;
  rightObject: 'menu' | 'action';
  pageUrl: string;
  description?: string;
  sortCode: number;
  status: 1 | 2;
  icon?: string;
  children?: MenuItemWithChildren[];
  i18nKey?: string;
  hideInMenu?: boolean;
  custom?: {
    color?: string;
  }
}

export const frontendMenus: MenuItemWithChildren[] = [
  {
    rightId: 101,
    parentId: 0,
    rightName: 'Home',
    rightObject: 'menu',
    pageUrl: '/home',
    description: '首页',
    sortCode: 1,
    status: 1,
    icon: 'local:icon-home',
    i18nKey: 'common.menus.home',
    hideInMenu: true,
    children: [
      {
        rightId: 101001,
        parentId: 101,
        rightName: 'Home',
        rightObject: 'menu',
        pageUrl: '/home',
        description: '首页',
        sortCode: 1,
        status: 1,
        i18nKey: 'common.menus.home.index',
      },
      {
        rightId: 101002,
        parentId: 101,
        rightName: 'Product',
        rightObject: 'menu',
        pageUrl: '/home/product',
        description: '产品',
        sortCode: 2,
        status: 1,
        i18nKey: 'common.menus.home.product',
      },
      {
        rightId: 101003,
        parentId: 101,
        rightName: 'Solution',
        rightObject: 'menu',
        pageUrl: '/home/solution',
        description: '方案',
        sortCode: 3,
        status: 1,
        i18nKey: 'common.menus.home.solution',
      },
      {
        rightId: 101004,
        parentId: 101,
        rightName: 'Pricing',
        rightObject: 'menu',
        pageUrl: '/home/pricing',
        description: '定价',
        sortCode: 4,
        status: 1,
        i18nKey: 'common.menus.home.pricing',
      },
      {
        rightId: 101005,
        parentId: 101,
        rightName: 'Partnership',
        rightObject: 'menu',
        pageUrl: '/home/partnership',
        description: '合作',
        sortCode: 5,
        status: 1,
        i18nKey: 'common.menus.home.partnership',
      },
    ],
  },
  {
    rightId: 102,
    parentId: 0,
    rightName: 'PPT',
    rightObject: 'menu',
    pageUrl: '/ppt',
    description: 'PPT编辑',
    sortCode: 2,
    status: 1,
    icon: 'local:icon-ppt',
    i18nKey: 'common.menus.ppt',
    hideInMenu: false,
    children: [
      {
        rightId: 102001,
        parentId: 102,
        rightName: '鏂板缓PPT',
        rightObject: 'menu',
        pageUrl: '/ppt/new',
        description: '创建PPT',
        sortCode: 1,
        status: 1,
        icon: 'ant-design:plus-outlined',
        i18nKey: 'common.menus.ppt.create',
        custom: {
          color: "var(--ant-color-primary)"
        }
      },
      {
        rightId: 102002,
        parentId: 102,
        rightName: 'My Works',
        rightObject: 'menu',
        pageUrl: '/ppt/my-works',
        description: '我的作品',
        sortCode: 2,
        status: 1,
        icon: 'local:icon-ppt-mywork',
        i18nKey: 'common.menus.ppt.myWorks',
      },
      {
        rightId: 102003,
        parentId: 102,
        rightName: 'My Templates',
        rightObject: 'menu',
        pageUrl: '/ppt/my-templates',
        description: '我的模板',
        sortCode: 3,
        status: 1,
        icon: 'local:icon-ppt-template',
        i18nKey: 'common.menus.ppt.myTemplates',
      },
      {
        rightId: 102004,
        parentId: 102,
        rightName: 'Template Market',
        rightObject: 'menu',
        pageUrl: '/ppt/template-market',
        description: '模板广场',
        sortCode: 4,
        status: 1,
        icon: 'local:icon-template-market',
        i18nKey: 'common.menus.ppt.templateMarket',
      },
    ],
  },
];

export function getAllMenus(): MenuItemWithChildren[] {
  const result: MenuItemWithChildren[] = [];

  function flatten(menus: MenuItemWithChildren[]) {
    menus.forEach((menu) => {
      result.push(menu);
      if (menu.children && menu.children.length > 0) {
        flatten(menu.children);
      }
    });
  }

  flatten(frontendMenus);
  return result;
}

export function getChildMenus(parentId: number): MenuItemWithChildren[] {
  const allMenus = getAllMenus();
  return allMenus.filter((menu) => menu.parentId === parentId);
}

export function getMenuByPath(path: string): MenuItemWithChildren | undefined {
  const allMenus = getAllMenus();
  return allMenus.find((menu) => menu.pageUrl === path);
}

export function getTopLevelMenus(): MenuItemWithChildren[] {
  return frontendMenus.filter((menu) => menu.parentId === 0);
}

export function isInHomePage(path: string): boolean {
  return path.startsWith('/home');
}

export function getHomeTabMenus(): MenuItemWithChildren[] {
  const homeMenu = frontendMenus.find((m) => m.rightId === 101);
  return homeMenu?.children || [];
}
