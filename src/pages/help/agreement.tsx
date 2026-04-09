import React from 'react';

const Agreement: React.FC = () => {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold text-slate-900">MatePPT 用户服务协议</h1>
        </header>

        <section className="space-y-6 text-sm leading-7">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">欢迎使用 MatePPT！</h2>
            <p className="mt-2">
              MatePPT（mateai.co）是一款 AI 智能生成 PPT 的在线工具。当您注册、登录或使用我们的服务时，即表示您已阅读并同意本协议。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">一、 我们提供的服务</h2>
            <ol className="mt-2 list-decimal pl-5 space-y-2">
              <li>
                <strong>功能说明</strong>：我们利用 AI 技术为您提供 PPT 自动生成、在线编辑、模板及素材下载等服务。
              </li>
              <li>
                <strong>授权范围</strong>：我们授予您个人的、不可转让的许可来使用本软件。未经许可，您不能将软件本身进行倒卖、破解或反向编译。
              </li>
            </ol>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">二、 关于您的账号</h2>
            <ol className="mt-2 list-decimal pl-5 space-y-2">
              <li>
                <strong>注册责任</strong>：您应提供真实信息，并负责保护好账号密码。因账号借给他人使用或密码泄露导致的损失，由您自行承担。
              </li>
              <li>
                <strong>唯一性</strong>：原则上一个用户仅限拥有一个账号，严禁恶意批量注册。
              </li>
            </ol>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">三、 知识产权与内容规范</h2>
            <ol className="mt-2 list-decimal pl-5 space-y-2">
              <li>
                <strong>您的内容</strong>：您上传的素材、输入的文字版权归您，但您授权我们为提供服务之目的进行必要的存储和处理。
              </li>
              <li>
                <strong>AI 生成内容</strong>：
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>
                    <strong>标识义务</strong>：根据国家法律，AI 生成的内容应带有“由 AI 生成”的标识。您不应通过技术手段恶意删除或遮挡该标识。
                  </li>
                  <li>
                    <strong>合法使用</strong>：您不能利用 AI 制作、发布任何违法、侵权、色情或暴力的内容。
                  </li>
                </ul>
              </li>
              <li>
                <strong>商用说明</strong>：免费用户仅限个人非商业使用。如需将设计成品用于商业营利，请升级至相应的 Pro/VIP 会员。
              </li>
            </ol>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">四、 付费与退款政策</h2>
            <ol className="mt-2 list-decimal pl-5 space-y-2">
              <li>
                <strong>增值服务</strong>：部分高级功能（如无水印导出、高级模板）需付费使用。
              </li>
              <li>
                <strong>退款规则</strong>：
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>
                    由于 PPT 及 AI 服务属于下载后即完成消费的<strong>数字商品</strong>，一旦使用（如已生成 PPT 或下载模板），
                    <strong>原则上不支持无理由退款</strong>。
                  </li>
                  <li>如遇系统故障导致服务连续 24 小时无法使用，请联系客服处理。</li>
                </ul>
              </li>
            </ol>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">五、 免责与限制</h2>
            <ol className="mt-2 list-decimal pl-5 space-y-2">
              <li>
                <strong>AI 局限性</strong>：AI 生成的内容具有随机性，可能存在事实错误或不准确，仅供参考。由此产生的任何损失，平台不承担直接赔偿责任。
              </li>
              <li>
                <strong>不可抗力</strong>：因服务器维护、网络攻击、黑客入侵等不可预测因素导致的服务中断，我们会尽快修复，但不承担由此产生的损失。
              </li>
              <li>
                <strong>赔偿限额</strong>：在法律允许的范围内，我们承担的最大赔偿责任不超过您在过去 12 个月内实际支付给我们的费用。
              </li>
            </ol>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">六、 协议修改与争议解决</h2>
            <ol className="mt-2 list-decimal pl-5 space-y-2">
              <li>
                <strong>协议更新</strong>：我们可能会根据法律或产品变化修改本协议。若您在修改后继续使用，则视为同意新协议。
              </li>
              <li>
                <strong>纠纷解决</strong>：若发生争议，双方应友好协商；协商不成的，应提交至南京市秦淮区人民法院诉讼解决。
              </li>
            </ol>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">联系我们</h2>
            <ul className="mt-2 list-disc pl-5 space-y-2">
              <li>
                <strong>官方网站</strong>：https://mateai.co
              </li>
              <li>
                <strong>客服/投诉邮箱</strong>：bubuxiu@mateai.co
              </li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Agreement;
