import { useEffect, useRef, useState } from 'react';
import { AssistantPanel } from './AssistantPanel';
import { motion, useMotionValue } from 'framer-motion';
import { FeedbackButtonSecondEntry } from "@/components/base/Feedback/FeedbackButtonSecondEntry";
import { useEventStore } from "@/stores/eventStore";
import { CreateMode } from '@/stores/pptProjectStore';


interface AssistantProProps {
    slideNo: number;
    createMode?:CreateMode
}

const AssistantPro: React.FC<AssistantProProps> = ({ slideNo, createMode }) => {
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);
    const hasDraggedRef = useRef(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const eventStore = useEventStore();
    const onFeedbackClick = (e) => {
        
        e.stopPropagation();
        
        eventStore.emit('Feedback/ButtonClick', { event: e, data: {} });
    };

    useEffect(() => {
        x.set(position.x);
        y.set(position.y);
    }, [position.x, position.y, x, y]);


    return (
        <div className="">



            {/* 可拖拽 AI 入口 */}
            {!isAssistantOpen && (
                <motion.div
                    drag
                    dragMomentum={false}
                    dragConstraints={{ left: -2400, right: 0, top: -800, bottom: 0 }}
                    whileHover={{ cursor: 'grab' }}
                    whileDrag={{ cursor: 'grabbing', scale: 0.95 }}
                    className="fixed bottom-[70px] right-[20px] z-40"
                    style={{ x, y }}
                    onDragStart={() => {
                        hasDraggedRef.current = true;
                    }}
                    onDragEnd={() => {
                        setPosition({ x: x.get(), y: y.get() });
                        window.setTimeout(() => {
                            hasDraggedRef.current = false;
                        }, 0);
                    }}
                    onTap={(e) => {
                        if ((e.target as HTMLElement).closest('[data-feedback-entry]')) return;
                        if (createMode === CreateMode.Classic) return;
                        if (!hasDraggedRef.current) {
                            setIsAssistantOpen(true);
                        }
                    }}
                >
                    <FeedbackButtonSecondEntry onClick={onFeedbackClick} />
                    <div className="group transition-all duration-700">
                        <div className="absolute inset-[-4px] rounded-full bg-gradient-to-tr from-[#6344ff]/40 via-[#ff80e6]/40 to-[#2fd8fe]/40 blur-2xl opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-1000"></div>

                        <div className="relative w-16 h-16 flex items-center justify-center overflow-visible">
                            <div className="absolute inset-[4px] pointer-events-none z-20">
                                <div className="absolute inset-0 animate-[spin_3s_linear_infinite]">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#6344ff] rounded-full shadow-[0_0_10px_rgba(99,68,255,1)]"></div>
                                </div>
                                <div className="absolute inset-0 animate-[spin_5s_linear_infinite_reverse]">
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#2fd8fe] rounded-full shadow-[0_0_8px_rgba(47,216,254,0.8)] opacity-60"></div>
                                </div>
                            </div>
{/* 
                            <div className="absolute inset-[2px] pointer-events-none z-20">
                                <div className="absolute top-1 right-1 w-4 h-4 text-[#6344ff] transition-all duration-500">
                                    <div className="w-full h-full animate-[pulse_2s_infinite] group-hover:animate-[spin_0.8s_linear_infinite]">
                                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" /></svg>
                                    </div>
                                </div>
                                <div className="absolute bottom-1 left-1 w-3 h-3 text-[#ff80e6] transition-all duration-500">
                                    <div className="w-full h-full animate-[pulse_1.5s_infinite_0.5s] group-hover:animate-[spin_0.6s_linear_infinite_reverse]">
                                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" /></svg>
                                    </div>
                                </div>
                            </div> */}

                            <div className="relative w-full h-full z-10 transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] group-hover:scale-105">
                                <svg viewBox="0 0 70 69.0205" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
                                    <defs>
                                        <filter id="logo_drag_glow" width="70" height="69.0205" x="0" y="0" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                            <feGaussianBlur stdDeviation="3" result="blur" />
                                        </filter>
                                        <linearGradient id="logo_drag_grad" x1="11" x2="59" y1="34.7" y2="34.4" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#F87BFF" offset="0" />
                                            <stop stopColor="#FB92CF" offset="0.24" />
                                            <stop stopColor="#FFDD9B" offset="0.48" />
                                            <stop stopColor="#C2F0B1" offset="0.73" />
                                            <stop stopColor="#2FD8FE" offset="1" />
                                        </linearGradient>
                                    </defs>
                                    <g opacity="0.3" className="group-hover:opacity-100 transition-opacity">
                                        <rect width="48" height="47.02" x="11" y="11" rx="23.5" fill="url(#logo_drag_grad)" filter="url(#logo_drag_glow)" />
                                    </g>
                                    <path d="M55 35C55 46.0457 46.0457 55 35 55C23.9543 55 15 46.0457 15 35C15 23.9543 23.9543 15 35 15C46.0457 15 55 23.9543 55 35Z" fill="#5C3DF5" fillRule="nonzero" />
                                    <path d="M41.5831 23C39.4407 23 37.7039 24.7466 37.7039 26.9012C37.7039 29.0557 39.4407 30.8023 41.5831 30.8023C43.7256 30.8023 45.4624 29.0557 45.4624 26.9012C45.4624 24.7466 43.7256 23 41.5831 23ZM19.3662 40.4453L26.1921 25.7663C26.8921 24.261 28.4258 23.4157 29.9812 23.5265C31.5365 23.4157 33.0702 24.261 33.7702 25.7663L40.5962 40.4453C41.5037 42.397 40.6662 44.7191 38.7255 45.6318C36.7847 46.5444 34.4758 45.7022 33.5682 43.7505L29.9812 36.0367L26.3941 43.7505C25.4866 45.7022 23.1776 46.5444 21.2369 45.6318C19.2962 44.7191 18.4586 42.397 19.3662 40.4453ZM48.9161 34.0779L51.6338 39.9224C52.5414 41.8741 51.7038 44.1961 49.7631 45.1088C47.8224 46.0215 45.5134 45.1792 44.6059 43.2275L41.8881 37.3831C40.9806 35.4314 41.8181 33.1094 43.7588 32.1967C45.6995 31.284 48.0085 32.1263 48.9161 34.0779Z" fill="white" fillRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            <AssistantPanel
                isOpen={isAssistantOpen}
                onClose={() => setIsAssistantOpen(false)}
                slideNo={slideNo}
            />
        </div>
    );
};

export default AssistantPro;
