import React from "react";
import * as HMIIcons from '../../assets/hmi-elements'
import { getSVGStyle } from "../../hooks/svg";


export const Icon : React.FC<{options: any, icon: any}> = (props) => {
    const {options, icon} = props;

    const I = getSVGStyle(HMIIcons[icon], (_props) => ({
        stroke: (options?.opening == 'true' || options?.starting == 'true') ? 'yellow' : (options?.open == 'true' || options?.on == 'true' || parseFloat(options?.speed) > 0)? 'green' : 'gray',
        filter: `hue-rotate(${((options?.open == true || options?.open == 'true') || (options?.on == 'true')) ? '45' : '0'}deg)`
    }))
    
    return <I {...props} />
}