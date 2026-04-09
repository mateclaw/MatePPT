import { FC, ReactNode, useRef, useState } from "react";
interface FeedbackButtonProps {

    onClick?: (event) => void;
}
export const FeedbackButtonSecondEntry: FC<FeedbackButtonProps> = ({ onClick }) => {


    return (


        <div
            data-feedback-entry
            className="absolute -top-10 right-1  bg-indigo-600 text-white text-[10px] px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg animate-bounce"
            onClick={onClick}
        >
            反馈问题
            <div className="absolute top-full right-6 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-indigo-600"></div>
        </div>

    )
};

export default FeedbackButtonSecondEntry;
