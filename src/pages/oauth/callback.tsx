import React, { useEffect } from 'react';
import { Spin, message as AntMessage, Result } from 'antd';
import { useSearchParams, useNavigate } from 'umi';
import { UserService } from '@/services/user.service';
import OAuthService from '@/services/oauth.service';
import useUserStore from '@/stores/userStore';
import { validateOAuthState, clearOAuthStorage } from '@/utils/oauth';
const userService = UserService.getInstance();
/**
 * OAuth 回调处理页面
 * 用于处理 Google、GitHub、微信等 OAuth 提供商的回调
 * 
 * 工作流程：
 * 1. 提取 URL 中的 code 和 state
 * 2. 验证 state 防止 CSRF
 * 3. 根据回调来源判断登录类型
 * 4. 调用后端接口进行登录
 * 5. 保存用户信息和 token
 * 6. 重定向到首页或错误页面
 */
const OAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUserInfo, setAccessToken } = useUserStore();
  const oauthService = OAuthService.getInstance();
  

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      const { code, state, error: oauthError } = oauthService.getCallbackParams();
      const errorDescription = oauthService.getErrorDescription();

      // 检查 OAuth 提供商返回的错误
      if (oauthError) {
        const errorMsg = errorDescription || oauthError;
        throw new Error(`OAuth error: ${errorMsg}`);
      }

      const provider = oauthService.getProviderFromPathname(window.location.pathname);

      // 验证 state 防止 CSRF 攻击
      if (!validateOAuthState(state || '')) {
        // 验证失败，清理 sessionStorage
        clearOAuthStorage();
        throw new Error('Invalid OAuth state - possible CSRF attack detected');
      }

      if (!code) {
        // 没有授权码，清理 sessionStorage
        clearOAuthStorage();
        throw new Error('Authorization code not found in callback');
      }

      console.log(`[OAuth Callback] Provider: ${provider}, code: ${code}`);

      // 调用统一的 OAuth 登录服务
      oauthService.login(provider, code).subscribe({
        next: (res) => {
          const userData = res.data;
          if (userData && userData.token) {
            // 保存用户信息和 token
            setUserInfo(userData);
            setAccessToken(userData.token);
            AntMessage.success(`${provider} 登录成功`);

            // 延迟重定向，确保状态已更新
            setTimeout(() => {
              navigate('/');
            }, 500);
          } else {
            throw new Error('Invalid login response - missing token');
          }
        },
        error: (error) => {
          console.error(`[OAuth Callback] ${provider} login failed:`, error);

          // 登录失败，清理 sessionStorage
          clearOAuthStorage();
          const errorMsg = error?.message || error?.error?.message || '未知错误';
          setError(`${provider} 登录失败: ${errorMsg}`);
          setLoading(false);

          if (provider === 'wechat') {
            navigate('/login');
          }
        },
      });
    } catch (err: any) {
      console.error('[OAuth Callback] Error:', err);
      // 捕获异常，清理 sessionStorage
      clearOAuthStorage();
      setError(err?.message || '登录过程出错，请重试');
      setLoading(false);
    }
  };

  if (loading && !error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">正在处理登录，请稍候...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Result
          status="error"
          title="登录失败"
          subTitle={error}
          extra={
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              返回登录
            </button>
          }
        />
      </div>
    );
  }

  return null;
};

export default OAuthCallbackPage;
