import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold text-slate-900">MatePPT 隐私政策</h1>
        </header>

        <section className="space-y-6 text-sm leading-7">
          <p>
            欢迎使用 <strong>MatePPT（mateai.co）</strong>！我们承诺像保护自己的数据一样保护您的隐私。
          </p>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">1. 我们收集什么？</h2>
            <ul className="mt-2 list-disc pl-5 space-y-2">
              <li><strong>账号信息</strong>：您注册时的<strong>手机号或邮箱</strong>；第三方登录时的<strong>头像和昵称</strong>。</li>
              <li><strong>创作内容</strong>：您上传的图片、输入的文字、AI 生成的 PPT 作品及指令（为了让您能跨设备保存和编辑）。</li>
              <li><strong>功能权限</strong>：使用语音输入时需<strong>麦克风</strong>权限；修改头像时需<strong>相机/相册</strong>权限（仅在您使用该功能时请求）。</li>
              <li><strong>自动记录</strong>：为了系统安全及优化，我们会记录您的<strong>设备型号、IP地址及下载记录</strong>。</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">2. 我们如何使用？</h2>
            <ul className="mt-2 list-disc pl-5 space-y-2">
              <li>提供、维护并改进 MatePPT 的 AI 生成服务。</li>
              <li>为您保存设计记录，方便您随时查看、收藏或删除。</li>
              <li>处理您的会员订阅与订单。</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">3. 我们如何共享？</h2>
            <ul className="mt-2 list-disc pl-5 space-y-2">
              <li><strong>不转卖</strong>：我们不会将您的个人信息卖给任何第三方。</li>
              <li>
                <strong>必要合规</strong>：仅在支付（如微信/支付宝）、短信验证或法律强制要求时，才会与必要的合作伙伴共享去标识化的数据。
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">4. 您的权利</h2>
            <ul className="mt-2 list-disc pl-5 space-y-2">
              <li><strong>查阅更正</strong>：您可以在个人中心随时修改资料。</li>
              <li><strong>数据删除</strong>：您可以手动删除作图记录，也可以申请<strong>注销账号</strong>。账号注销后，我们会立即删除您的所有个人信息和云端作品。</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">5. 数据安全</h2>
            <p className="mt-2">
              我们采用必要的技术保护您的数据传输和存储，数据存储于中华人民共和国境内。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">6. 联系我们</h2>
            <p className="mt-2">如有隐私疑问，请联系：</p>
            <ul className="mt-2 list-disc pl-5 space-y-2">
              <li><strong>邮箱</strong>：bubuxiu@mateai.co</li>
              <li>我们承诺在 <strong>15 个工作日</strong>内处理您的反馈。</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
