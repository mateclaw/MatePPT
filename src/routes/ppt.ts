import { iRoute } from "@/types/base";

const moduleName = 'ppt';

const moduleRoutes: iRoute[] = [
  {
    path: '/ppt/new',
    meta: {},
    component: `@/pages/${moduleName}/ppt-new`,
    submenuRender: true,
  },
  {
    path: '/ppt/detail/:id/outline',
    meta: {},
    component: `@/pages/${moduleName}/ppt-detail.outline`,
    submenuRender: false,
  },
  {
    path: '/ppt/detail/:id/template',
    meta: {},
    component: `@/pages/${moduleName}/ppt-detail.template`,
    submenuRender: false,
  },
  {
    path: '/ppt/detail/:id/editor',
    meta: {},
    component: `@/pages/${moduleName}/ppt-detail.editor`,
    submenuRender: false,
  },
  {
    path: '/ppt/detail/:id/editor-classic',
    meta: {},
    component: `@/pages/${moduleName}/ppt-detail.editor-classic`,
    submenuRender: false,
  },
  {
    path: '/ppt/detail/:id/viewer',
    meta: {},
    component: `@/pages/${moduleName}/ppt-detail.viewer`,
    submenuRender: false,
  },
  {
    path: '/ppt/my-works',
    meta: {},
    component: `@/pages/${moduleName}/ppt-my-works`,
    submenuRender: true,
  },
  {
    path: '/ppt/my-templates',
    meta: {},
    component: `@/pages/${moduleName}/ppt-my-templates`,
    submenuRender: true,
  },
  {
    path: '/ppt/template-market',
    meta: {},
    component: `@/pages/${moduleName}/ppt-template-market`,
    submenuRender: true,
  },
  {
    path: '/ppt/my-templates/new',
    meta: {},
    component: `@/pages/${moduleName}/ppt-new-template`,
    submenuRender: true,
  },
  {
    path: '/ppt/my-templates/:id',
    meta: {},
    component: `@/pages/${moduleName}/ppt-annotate-template`,
    submenuRender: false,
  },
];

export default moduleRoutes;
