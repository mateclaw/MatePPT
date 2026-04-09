/**
 * OAuth 第三方登录服务
 * 统一管理 Google、GitHub、微信登录
 */

import { UserService } from './user.service';
import { Observable } from 'rxjs';
import { RSResult } from '@/models/common/rSResult';

export type OAuthProvider = 'google' | 'github' | 'wechat';

interface OAuthLoginResponse {
  code: string;
}

export class OAuthService {
  private static instance: OAuthService;
  private userService: UserService;

  private constructor() {
    this.userService = UserService.getInstance();
  }

  public static getInstance(): OAuthService {
    if (!OAuthService.instance) {
      OAuthService.instance = new OAuthService();
    }
    return OAuthService.instance;
  }

  /**
   * 统一的 OAuth 登录入口
   * @param provider - OAuth 提供商
   * @param code - 授权码
   */
  public login(provider: OAuthProvider, code: string): Observable<RSResult<any>> {
    switch (provider) {
      case 'google':
        return this.googleLogin(code);
      case 'github':
        return this.githubLogin(code);
      case 'wechat':
        return this.wechatLogin(code);
      default:
        throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
  }

  /**
   * Google 登录
   */
  private googleLogin(code: string): Observable<RSResult<any>> {
    console.log('[OAuthService] Google login with code:', code);
    return this.userService.googleLogin({ code } as any);
  }

  /**
   * GitHub 登录
   */
  private githubLogin(code: string): Observable<RSResult<any>> {
    console.log('[OAuthService] GitHub login with code:', code);
    return this.userService.githubLogin({ code } as any);
  }

  /**
   * 微信登录
   */
  private wechatLogin(code: string): Observable<RSResult<any>> {
    console.log('[OAuthService] WeChat login with code:', code);
    return this.userService.wechatWebappLogin({ code } as any);
  }

  /**
   * 从 URL 中提取 OAuth 提供商
   * 支持的路径格式:
   * - /oauth/callback/google
   * - /oauth/callback/github
   * - /oauth/callback/wechat
   */
  public getProviderFromPathname(pathname: string): OAuthProvider {
    if (pathname.includes('google')) return 'google';
    if (pathname.includes('github')) return 'github';
    if (pathname.includes('wechat')) return 'wechat';
    throw new Error(`Unable to determine OAuth provider from path: ${pathname}`);
  }

  /**
   * 从 URL 查询参数中提取授权码和状态
   */
  public getCallbackParams(): { code: string | null; state: string | null; error: string | null } {
    const params = new URLSearchParams(window.location.search);
    return {
      code: params.get('code'),
      state: params.get('state'),
      error: params.get('error'),
    };
  }

  /**
   * 获取错误信息描述
   * 某些 OAuth 提供商可能返回错误，需要优雅地处理
   */
  public getErrorDescription(): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get('error_description');
  }
}

export default OAuthService;
