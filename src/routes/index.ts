import { iRoute } from "@/types/base";
// import workflow from "./workflow";
// import system from "./system";
// import agent from "./agent";
// import kb from "./kb";
// import db from "./db";
// import chats from "./chats";
// import graph from "./graph";
// import plugin from "./plugin";
import ppt from "./ppt";
import admin from "./admin";

export const sysRoutes: iRoute[] = [
    {
        path: '/',
        redirect: '/ppt/new',
    },
    {
        path: '/login',
        layout: false,
        component: "@/pages/login/login",
    },
    {
        path: '/oauth/:provider/callback',
        layout: false,
        component: "@/pages/oauth/callback",
    },
    {
        path: '/test',
        layout: false,
        component: "@/pages/test",
    },
    {
        path: '/preview',
        layout: false,
        component: "@/pages/document-viewer/index",
    },
    {
        path: '/help/privacy',
        component: "@/pages/help/privacy",
        submenuRender: false,
    },
    {
        path: '/help/agreement',
        component: "@/pages/help/agreement",
        submenuRender: false,
    },
    ...ppt,
    ...admin,

    { path: "/*", component: "@/pages/404" },
]
