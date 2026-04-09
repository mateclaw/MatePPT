import { Pagination, Switch, type SwitchProps } from "antd";

import { FC, useMemo, useState, useEffect, memo } from "react";
import { useSetState } from "ahooks";

interface Props extends SwitchProps {
    // onPageChange: (pageNum, pageSize) => void
    checkedValue?: any;
    unCheckedValue?: any;
    value?: any;
    
}
const MateSwitch: FC<Props> = (props) => {
    const { checkedValue = true, unCheckedValue = false, onChange, value ,...otherProps} = props;

    const [checked, setChecked] = useState(value === checkedValue);
    const triggerChange = (isChecked: boolean, event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => {
        onChange?.(isChecked ? checkedValue : unCheckedValue,event);
    };

    const onValueChange = (isChecked: boolean, event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => {
        // setChecked(isChecked);
        triggerChange(isChecked, event);

    }

    useEffect(() => {
        setChecked(value === checkedValue);
    }, [value]);



    return (
        <Switch
            {...otherProps}
            value={checked}
            onChange={onValueChange}

        >
   
        </Switch>
    )
}

export default memo(MateSwitch);