import { iRoute } from "@/types/base";
const moduleName = 'admin';
const moduleRoutes: iRoute[] = [
  {
    path: '/admin/layout-list',
    meta: {
      
    },
    component: `@/pages/${moduleName}/layout-list`,
    submenuRender: true,
    
  },
  {
    path: '/admin/template-list',
    meta: {
      
    },
    component: `@/pages/${moduleName}/template-list`,
    submenuRender: true,
    
  },
  {
    path: '/admin/layout-detail/:id',
    meta: {
      
    },
    component: `@/pages/${moduleName}/layout-detail`,
    submenuRender: false,
    
  },
  {
    path: '/admin/template-detail/:id',
    meta: {
      
    },
    component: `@/pages/${moduleName}/template-detail`,
    submenuRender: false,
    
  },

]
export default moduleRoutes;
