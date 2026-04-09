import { FC, ReactNode, useRef, useState } from "react";
import FeedbackButtonSecondEntry from "./FeedbackButtonSecondEntry";
interface FeedbackButtonProps {

    onClick?: () => void;
}

export const FeedbackButton: FC<FeedbackButtonProps> = ({ onClick }) => {

    const [showSecondEntry, setShowSecondEntry] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setShowSecondEntry(true);
    };

    const handleMouseLeave = () => {
        timerRef.current = setTimeout(() => {
            setShowSecondEntry(false);
        }, 300); // 延迟 300ms 隐藏，给用户移动鼠标的时间
    };
    return (

        < div className="fixed  right-6 w-14 h-14 bg-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform group" onMouseEnter={handleMouseEnter}
            onClick={onClick}
            style={{ bottom: '10rem', right: '3.5rem' }}
            onMouseLeave={() => {
                handleMouseLeave()
            }}>

            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path></svg>
            </div>


            {
                showSecondEntry && (
                    <FeedbackButtonSecondEntry onClick={onClick} />
                )
            }
        </div >
    )
};

export default FeedbackButton;
