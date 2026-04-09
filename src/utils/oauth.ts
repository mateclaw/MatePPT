/**
 * OAuth 登录流程工具函数
 * 处理微信、GitHub、Google 等第三方登录
 */

// OAuth 配置信息（从环境变量或运行时配置读取）
interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  redirect_uri?: string;
  scope?: string;
  authorizationUrl: string;
}

// Google OAuth 配置
export const getGoogleOAuthConfig = (): OAuthConfig => ({
  clientId: '376056311403-5q7a8nfkajmu4727m5ancc8dsd5c83rv.apps.googleusercontent.com',
  redirectUri: `${window.location.origin}/oauth/google/callback`,
  redirect_uri: `${window.location.origin}/oauth/google/callback`,
  scope: 'openid profile email',
  authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
});

// GitHub OAuth 配置
export const getGithubOAuthConfig = (): OAuthConfig => ({
  // clientId: (window as any).runtimeConfig?.GITHUB_CLIENT_ID || '',
  clientId: 'Ov23li5fXcjbLOVjo9Yp',
  redirectUri: `${window.location.origin}/oauth/github/callback`,
  redirect_uri: `${window.location.origin}/oauth/github/callback`,
  scope: 'user:email',
  authorizationUrl: 'https://github.com/login/oauth/authorize',
});

// 微信 OAuth 配置
export const getWechatOAuthConfig = (): OAuthConfig => ({
  clientId: (window as any).runtimeConfig?.WECHAT_APP_ID || '',
  redirectUri: `${window.location.origin}/oauth/wechat/callback`,
  redirect_uri: `${window.location.origin}/oauth/wechat/callback`,
  scope: 'snsapi_login',
  authorizationUrl: 'https://open.weixin.qq.com/connect/qrconnect',
});

/**
 * 生成 OAuth 授权 URL
 * @param provider - OAuth 提供商 ('google' | 'github' | 'wechat')
 * @returns 授权 URL
 */
export const generateOAuthUrl = (provider: 'google' | 'github' | 'wechat'): string => {
  let config: OAuthConfig;

  switch (provider) {
    case 'google':
      config = getGoogleOAuthConfig();
      return `${config.authorizationUrl}?${new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: 'code',
        scope: config.scope || 'openid profile email',
        state: generateState(), // 防止 CSRF
      }).toString()}`;

    case 'github':
      config = getGithubOAuthConfig();
      return `${config.authorizationUrl}?${new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        scope: config.scope || 'user:email',
        state: generateState(),
        allow_signup: 'true',
      }).toString()}`;

    case 'wechat':
      config = getWechatOAuthConfig();
      // 微信 OAuth 需要拼接特殊参数
      return `${config.authorizationUrl}?${new URLSearchParams({
        appid: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: 'code',
        scope: config.scope || 'snsapi_login',
        state: generateState(),
      }).toString()}#wechat_redirect`;

    default:
      throw new Error(`Unsupported OAuth provider: ${provider}`);
  }
};

/**
 * 生成随机 state 用于防止 CSRF 攻击
 */
export const generateState = (): string => {
  const state = Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);
  // 存储到 sessionStorage，回调时验证
  sessionStorage.setItem('oauth_state', state);
  console.log('[OAuth] Generated and stored state for CSRF protection');
  return state;
};

/**
 * 验证 OAuth 回调中的 state
 */
export const validateOAuthState = (state: string): boolean => {
  const storedState = sessionStorage.getItem('oauth_state');
  sessionStorage.removeItem('oauth_state');
  return storedState === state;
};

/**
 * 清理 OAuth 相关的 sessionStorage
 * 在登录失败时调用
 */
export const clearOAuthStorage = (): void => {
  sessionStorage.removeItem('oauth_state');
  console.log('[OAuth] Cleared OAuth state from sessionStorage');
};

/**
 * 从 URL 查询参数中提取授权码
 */
export const getAuthorizationCode = (): { code: string | null; state: string | null } => {
  const params = new URLSearchParams(window.location.search);
  return {
    code: params.get('code'),
    state: params.get('state'),
  };
};

/**
 * 跳转到 OAuth 授权页面
 */
export const redirectToOAuthProvider = (provider: 'google' | 'github' | 'wechat'): void => {
  const authUrl = generateOAuthUrl(provider);
  window.location.href = authUrl;
};
