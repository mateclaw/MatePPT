import { PlusOutlined } from '@ant-design/icons'
import { Button, Tooltip, ConfigProvider } from 'antd'
import cn from '@/utils/classnames'
import { FC } from 'react'
import { useTranslate } from "@/hooks/common-hooks";
type ToggleButtonProps = {
    className?: string;
    onClick?: (e) => void;
    children?: React.ReactNode;
    isActive?: boolean;
    tooltip?: string;
}
const ToggleButton: FC<ToggleButtonProps> = ({ className, onClick, children, isActive, tooltip }: ToggleButtonProps) => {
    const { t } = useTranslate()
    return (
        <ConfigProvider theme={{
            components: {
                Tooltip: {
                    colorBgSpotlight: '#000',
                    colorTextLightSolid: '#fff',
                },
            }
        }}>
            <Tooltip title={tooltip} color='black'>

                <div className={cn('mate-toggle-button block-ellipsis px-3 rounded text-[13px]', isActive ? 'active' : '', className)} onClick={onClick}>
                    {children}
                </div>
            </Tooltip>
        </ConfigProvider>

    )
}

export default ToggleButton