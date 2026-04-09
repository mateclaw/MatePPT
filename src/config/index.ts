const rawPublicPath = process.env.UMI_APP_BASE_PATH || '/';
const publicPath = rawPublicPath.endsWith('/') ? rawPublicPath : `${rawPublicPath}/`;
const resolvePublicAsset = (assetPath: string) => `${publicPath}${assetPath.replace(/^\/+/, '')}`;
const runtimeHostname = typeof window !== 'undefined' ? window.location.hostname : '';
const githubPagesApiFallback = runtimeHostname.endsWith('github.io')
    ? 'https://api.mateppt.codingfgd.asia'
    : '';
const baseUrl = process.env.UMI_APP_API_BASE
    || process.env.UMI_API_BASE
    || githubPagesApiFallback;
const apiOrigin = baseUrl ? new URL(baseUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost').origin : '';
const demoSessionUrl = process.env.UMI_APP_DEMO_SESSION_URL
    || process.env.UMI_DEMO_SESSION_URL
    || (apiOrigin ? `${apiOrigin}/demo/session` : '');
const demoAutoLogin = process.env.UMI_APP_DEMO_AUTO_LOGIN === 'true'
    || process.env.UMI_DEMO_AUTO_LOGIN === 'true';

/**
 * 全局配置
    * @param appName 应用名称,这里是初始的设置，运行时会被sys_name覆盖
    * @param logoUrl 应用logo,这里是初始的设置，运行时会被sys_logo覆盖
 */
export const config = {
    appName: 'Mate AI',
    logoUrl: resolvePublicAsset('imgs/logo.svg'),
    plainLogoUrl: resolvePublicAsset('imgs/logo-plain.svg'),
    author:'MateAI',
    baseUrl,
    apiOrigin,
    baseMinioEndPoint:'',
    baseMinioPort:9000,
    baseBucketName:"mateai-v3",
    publicPath,
    demoAutoLogin,
    demoSessionUrl,
    resolvePublicAsset,
}
