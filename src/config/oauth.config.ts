/**
 * OAuth 第三方登录配置指南
 * 
 * 本项目支持三种第三方登录方式：
 * 1. Google OAuth 2.0
 * 2. GitHub OAuth 2.0
 * 3. 微信 Website App OAuth
 * 
 * ========================================
 * 配置步骤
 * ========================================
 */

/**
 * 步骤1: Google OAuth 配置
 * 
 * 1.1 访问 Google Cloud Console
 *     URL: https://console.cloud.google.com
 * 
 * 1.2 创建新项目或选择现有项目
 * 
 * 1.3 启用 Google+ API
 *     - 搜索 "Google+ API"
 *     - 点击启用
 * 
 * 1.4 创建 OAuth 2.0 凭证
 *     - 转到 "凭证" 页面
 *     - 点击 "创建凭证" > "OAuth 客户端 ID"
 *     - 应用类型选择 "Web 应用"
 *     - 填写授权重定向 URI:
 *       - http://localhost:8000/oauth/callback/google (开发环境)
 *       - https://yourdomain.com/oauth/callback/google (生产环境)
 * 
 * 1.5 后端配置
 *     在后端应用的环境变量中设置:
 *     GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
 *     GOOGLE_CLIENT_SECRET=your_client_secret
 *     GOOGLE_REDIRECT_URI=http://localhost:8000/oauth/callback/google
 * 
 * 参考文档: https://developers.google.com/identity/protocols/oauth2
 */

/**
 * 步骤2: GitHub OAuth 配置
 * 
 * 2.1 访问 GitHub 开发者设置
 *     URL: https://github.com/settings/developers
 * 
 * 2.2 创建新的 OAuth App
 *     - 点击 "New OAuth App" 或 "Register a new application"
 *     - 填写应用信息:
 *       - Application name: Your App Name
 *       - Homepage URL: http://localhost:8000 (开发环境)
 *       - Authorization callback URL: http://localhost:8000/oauth/callback/github
 * 
 * 2.3 获取凭证
 *     - Client ID (从 OAuth App 页面获取)
 *     - Client Secret (生成新的)
 * 
 * 2.4 后端配置
 *     在后端应用的环境变量中设置:
 *     GITHUB_CLIENT_ID=your_client_id
 *     GITHUB_CLIENT_SECRET=your_client_secret
 *     GITHUB_REDIRECT_URI=http://localhost:8000/oauth/callback/github
 * 
 * 参考文档: https://docs.github.com/en/developers/apps/building-oauth-apps
 */

/**
 * 步骤3: 微信 Website App OAuth 配置
 * 
 * 3.1 访问微信开放平台
 *     URL: https://open.weixin.qq.com
 * 
 * 3.2 注册开发者账号（需要企业认证）
 * 
 * 3.3 创建 Website App
 *     - 登录后台管理
 *     - 进入应用管理 > 网站应用
 *     - 创建新应用
 * 
 * 3.4 配置应用信息
 *     - 应用名称: Your App Name
 *     - 授权回调域: yourdomain.com (必须是公网域名)
 *     - 注意: 不需要填 http/https 前缀
 * 
 * 3.5 获取凭证
 *     - AppID (应用ID)
 *     - AppSecret (应用密钥)
 * 
 * 3.6 后端配置
 *     在后端应用的环境变量中设置:
 *     WECHAT_APP_ID=your_app_id
 *     WECHAT_APP_SECRET=your_app_secret
 *     WECHAT_REDIRECT_URI=https://yourdomain.com/oauth/callback/wechat
 * 
 * 3.7 安全提示
 *     - 微信 OAuth 回调 URL 的域名必须是公网可访问的
 *     - 不能使用 localhost 或内网 IP（开发环境可使用代理工具如 ngrok）
 *     - 确保你的应用已通过微信认证
 * 
 * 参考文档: https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html
 */

/**
 * ========================================
 * 后端接口要求说明
 * ========================================
 * 
 * 后端需要实现以下三个接口：
 * 
 * 1. Google 登录接口
 *    POST /aippt/api/user/google/login
 *    请求体: { code: string }
 *    返回: { data: { token: string, userId: string, email: string, ... } }
 * 
 * 2. GitHub 登录接口
 *    POST /aippt/api/user/github/login
 *    请求体: { code: string }
 *    返回: { data: { token: string, userId: string, login: string, ... } }
 * 
 * 3. 微信登录接口
 *    POST /aippt/api/user/wechat/webapp/login
 *    请求体: { code: string }
 *    返回: { data: { token: string, userId: string, nickname: string, ... } }
 * 
 * 后端实现流程（伪代码）：
 * 
 * @PostMapping("/google/login")
 * public Result<UserPo> googleLogin(@RequestBody UserPo param) {
 *     // 1. 从前端获取授权码
 *     String code = param.getCode();
 *     
 *     // 2. 使用 code 调用 Google API 获取 access token
 *     GoogleAuthResponse googleResp = googleAuthService.getTokenByCode(code);
 *     
 *     // 3. 使用 access token 获取用户信息
 *     GoogleUserInfo userInfo = googleAuthService.getUserInfo(googleResp.accessToken);
 *     
 *     // 4. 查询或创建本地用户
 *     UserPo user = userService.findOrCreateByEmail(userInfo.email);
 *     
 *     // 5. 生成 JWT token
 *     String token = tokenService.generateToken(user.id);
 *     
 *     // 6. 返回用户信息和 token
 *     user.setToken(token);
 *     return Result.ok(user);
 * }
 */

/**
 * ========================================
 * 前端工作流程说明
 * ========================================
 * 
 * OAuth 登录完整流程：
 * 
 * 1. 用户点击 "Sign in with Google" 按钮
 *    → 调用 redirectToOAuthProvider('google')
 * 
 * 2. redirectToOAuthProvider() 生成授权 URL 并重定向到 Google
 *    → URL: https://accounts.google.com/o/oauth2/v2/auth?...
 * 
 * 3. 用户在 Google 登录并授权应用
 * 
 * 4. Google 重定向回应用的回调 URL
 *    → http://localhost:8000/oauth/callback/google?code=xxx&state=yyy
 * 
 * 5. 前端路由匹配到 /oauth/callback/:provider
 *    → 加载 OAuthCallbackPage 组件
 * 
 * 6. OAuthCallbackPage 组件执行以下操作：
 *    a) 从 URL 提取 code 和 state
 *    b) 验证 state 防止 CSRF 攻击
 *    c) 调用后端 /user/google/login 接口，传入 code
 *    d) 后端返回用户信息和 token
 *    e) 保存 token 到 useUserStore
 *    f) 重定向到首页 /
 * 
 * 7. 应用加载完成，用户已登录
 * 
 * ========================================
 * 文件修改清单
 * ========================================
 * 
 * 已修改的文件：
 * 
 * 1. ✅ src/utils/oauth.ts
 *    - 新增 OAuth URL 生成函数
 *    - 新增 state 验证函数
 *    - 导出 redirectToOAuthProvider 函数
 * 
 * 2. ✅ src/components/base/login-form/index.tsx
 *    - 更新 toGoogle() 使用 redirectToOAuthProvider
 *    - 更新 toGithub() 使用 redirectToOAuthProvider
 *    - 更新 toWechat() 使用 redirectToOAuthProvider
 * 
 * 3. ✅ src/pages/oauth/callback.tsx
 *    - 新增 OAuth 回调页面
 *    - 处理 code 和 state
 *    - 调用后端登录接口
 * 
 * 4. ✅ src/routes/index.ts
 *    - 新增 /oauth/callback/:provider 路由
 * 
 * 5. ⚠️ 需要后端实现以下接口：
 *    - POST /aippt/api/user/google/login
 *    - POST /aippt/api/user/github/login
 *    - POST /aippt/api/user/wechat/webapp/login
 * 
 * ========================================
 */

export const OAUTH_CONFIG = {
  // 标记 OAuth 功能已启用
  ENABLED: true,

  // OAuth 提供商列表
  PROVIDERS: ['google', 'github', 'wechat'] as const,

  // 回调路径前缀
  CALLBACK_PATH: '/oauth/callback',

  // 本地存储键名
  STATE_STORAGE_KEY: 'oauth_state',
};
