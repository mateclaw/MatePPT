
import { FC } from "react";
import { Avatar } from "antd";
import SystemLogo from "@/components/base/system-logo";

interface placeholderNodeProps {
    className?: string;
    guideWords?: string;
    questions?: string[];
    onQuestionClick?: (question: string) => void;
}
const placeholderNode: FC<placeholderNodeProps> = (props) => {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full flex-1 p-5 ">
            <SystemLogo size={40} className="flex-none" />

            <div className="text-gray-500   text-2xl break-all flex-none"> {props.guideWords || '有什么可以帮您的吗？'}</div>

            {props.questions && props.questions.length > 0 && <div >

                {/* <div className="text-gray-500   text-lg break-all flex-none">常用问题：</div> */}
                
                {
                    props.questions.map((item, index) => (

                        item.trim() && <div key={index} className="text-gray-500 bg-[#e0ebff] px-4 py-2 mt-4 cursor-pointer rounded-md text-base break-all flex-none" onClick={() => props.onQuestionClick && props.onQuestionClick(item)}>{item}</div>
                    ))
                }


            </div>}
        </div >
    )
}

export default placeholderNode