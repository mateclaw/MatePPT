import { iRoute } from "@/types/base";
const moduleName = 'system';
const moduleRoutes: iRoute[] = [

  {
    path: '/system',
    // redirect:'/system/user',
    component:'@/pages/system/index',

    routes: [
      { index: true, redirect: '/system/dept' },
      {
        path: '/system/user',
        meta: {},
        component: `@/pages/${moduleName}/user`,
        submenuRender: true,
        wrappers: [
          '@/wrappers/auth',
        ],

      },
      {
        path: '/system/dept',
        meta: {},
        component: `@/pages/${moduleName}/dept`,
        submenuRender: true,
        wrappers: [
          '@/wrappers/auth',
        ],
      },
      {
        path: '/system/role',
        meta: {},
        component: `@/pages/${moduleName}/role`,
        submenuRender: true,
        wrappers: [
          '@/wrappers/auth',
        ],

      },
      {
        path: '/system/menu',
        meta: {},
        component: `@/pages/${moduleName}/menu`,
        submenuRender: true,
        wrappers: [
          '@/wrappers/auth',
        ],
      },
      {
        path: '/system/config',
        meta: {},
        component: `@/pages/${moduleName}/config`,
        submenuRender: true,
        wrappers: [
          '@/wrappers/auth',
        ],
      },
      {
        path: '/system/llm',
        meta: {},
        component: `@/pages/${moduleName}/llm`,
        submenuRender: true,
        wrappers: [
          '@/wrappers/auth',
        ],
      },
      {
        path: '/system/mcp',
        meta: {},
        component: `@/pages/${moduleName}/mcp`,
        submenuRender: true,
        wrappers: [
          '@/wrappers/auth',
        ],
      },
      {
        path: '/system/agent-category',
        meta: {},
        component: `@/pages/${moduleName}/agent-category`,
        submenuRender: true,
        // wrappers: [
        //   '@/wrappers/auth',
        // ],
      },
    ]
  },

  // {
  //   path: '/flow',
  //   meta:{},
  //   component:`@/pages/flow/index`

  // }
]
export default moduleRoutes;