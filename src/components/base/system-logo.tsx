
import type { FC } from 'react'
import React, { useCallback, useState } from 'react'
// import Slider from '@/components/base/slider'
import { Slider, InputNumber, Avatar } from "antd";
import { } from "@/utils/common-util";
import { cn } from '@/lib/utils';
import useSystemStore from "@/stores/systemStore";

type Props = {
    className?: string,
    size?: number,
    isPlain?: boolean
}



const SystemLogo: FC<Props> = (props) => {
    const { className,  size,isPlain } = props;

    const systemStore = useSystemStore;
    
    const logoUrl = useSystemStore(state => state.logoUrl);
    const plainLogoUrl = useSystemStore(state => state.plainLogoUrl);

    const url = isPlain ? plainLogoUrl : logoUrl;

    return (
        <Avatar size={size} src={url} className={cn('w-full h-full', className)}   />
    )
}
export default React.memo(SystemLogo)
