import { PlusOutlined } from '@ant-design/icons'
import { Tag } from 'antd'
import cn from '@/utils/classnames'
import { FC } from 'react'

const defaultColorList = [
    ['', 'success', 'error'],
]

interface TagProps {
    className?: string
    onClick?: () => void
    disabled?: boolean
    children?: React.ReactNode
    title?: string
    colorList?: string[]
    value?: number
    /**
     * 0:['', 'success', 'error']
     */
    type?: number
}
const MateTag: FC<TagProps> = ({ className, onClick, disabled, children, ...props }: TagProps) => {
    const type = props.type || 0
    const colors = props.colorList || defaultColorList[type]
    const value = props.value || 0;

    return (
        <Tag className={cn('mate-tag', className)} {...props} onClick={onClick} title={props.title} color={colors[value]}>


            {children ? children : <span className='mate-tag-text'>

            </span>}
        </Tag>
    )
}

export default MateTag