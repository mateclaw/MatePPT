import React from 'react';
import { Popover } from 'antd';
import { Link } from 'umi';
import contactImg from "@/assets/mateai/contact.png";

const NewFooter: React.FC = () => {
    return (
        <footer className="bg-white py-12 border-t border-slate-200 text-sm text-slate-500" style={{
            paddingTop: '3rem',
            paddingBottom: '3rem',
        }}>
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-6">

                    {/* Left: Copyright */}
                    <div className=" text-center lg:text-left">
                        &copy; {new Date().getFullYear()} Mate AI. All rights reserved.
                    </div>

                    {/* Center: ICP Info */}
                    <div className=" flex flex-row  items-center gap-2 sm:gap-4 text-xs text-slate-400">
                        <a
                            href="https://beian.miit.gov.cn/#/Integrated/index"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-slate-600 transition-colors text-slate-400"
                        >
                            苏ICP备19039618号-9
                        </a>
                        <span className="hidden sm:inline text-slate-300">|</span>
                        <a
                            href="http://www.beian.gov.cn/portal/registerSystemInfo"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-slate-600 transition-colors text-slate-400"
                        >
                            苏公网安备 11111111111105号
                        </a>
                    </div>

                    {/* Right: Links */}
                    <div className=" flex items-center gap-6">
                        <Link target='_blank' to="/help/privacy" className="text-slate-500 hover:text-brand-600 transition-colors">隐私政策</Link>
                        <Link target='_blank' to="/help/agreement" className="text-slate-500 hover:text-brand-600 transition-colors">用户协议</Link>

                        {/* Contact Us with QR Popup */}
                        <div className="relative">


                            <Popover content={
                                <div className=" mb-3 z-50 animate-pop-in">
                                    {/* Increased width from w-32 to w-64, padding from p-3 to p-4 */}
                                    <div className="bg-white p-4 rounded-xl  w-64 flex flex-col items-center">
                                        {/* QR Code Image Placeholder: Increased from w-24 h-24 to w-48 h-48 */}
                                        <div className="w-48 h-48 bg-slate-900 rounded-lg mb-3 overflow-hidden">
                                            {/* Increased query size to 300x300 for better resolution */}
                                            <img
                                                src={contactImg}
                                                alt="Contact QR"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="text-xs text-slate-500 font-medium text-center">使用微信扫码与我们联系</span>

                                        {/* Little triangle arrow pointing down */}
                                        <div className=" w-3 h-3 bg-white border-b border-r border-slate-100 rotate-45"></div>
                                    </div>
                                </div>
                            }>
                                <button

                                    className="hover:text-brand-600 transition-colors outline-none"
                                >
                                    联系我们
                                </button>

                            </Popover>
                        </div>
                    </div>

                </div>
            </div>
        </footer>
    );
};

export default NewFooter;
