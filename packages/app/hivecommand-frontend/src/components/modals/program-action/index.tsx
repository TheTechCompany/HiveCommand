
import React, { useEffect, useState } from "react";
import { BaseModal, FormControl, FormInput } from '@hexhive/ui';
import { Box, CheckBox, TextInput } from "grommet";

export interface ActionModalProps {
    devices?: any[];

    open: boolean;
    selected?: any;
    onClose?: () => void;
    onSubmit?: (condition) => void;
    onDelete?: () => void;
}

export const ProgramActionModal : React.FC<ActionModalProps> = (props) => {

    const [action, setAction] = useState<{
        device?: string;
        request?: string;
        release?: boolean;
    }>({});


    useEffect(() => {
        setAction({
            ...props.selected,
            device: props.selected?.device?.id || props.selected?.device,
            request: props.selected?.request?.id || props.selected?.request,
        })
    }, [props.selected]);


    const updateKey = (key: string, value: any) => {
        setAction({
            ...action,
            [key]: value
        })
    }

    const submit = () => {
        props.onSubmit?.(action)
    }

 
    console.log({devices: props.devices, action: action.device})

    return (
        <BaseModal
            title="Action"
            open={props.open}
            onClose={props.onClose}
            onSubmit={submit}
            onDelete={props.selected && props.onDelete}
            >
            <FormControl 
                value={action.device}
                onChange={(value) => updateKey('device', value)}
                options={props.devices || []}
                labelKey="name"
                valueKey="id"
                placeholder="Device" />
            <FormControl 
                value={action.request}
                onChange={(value) => updateKey('request', value)}
                placeholder="Action" 
                options={props.devices?.find((a) => a.id == action.device)?.type?.actions || []} 
                labelKey={'key'}
                valueKey={'id'} />
            <Box pad={{top: 'xsmall'}} direction="row" justify="end">
                <CheckBox 
                    reverse
                    checked={action.release}
                    onChange={(e) => updateKey('release', e.target.checked)}
                    label="Release" />
            </Box>
        </BaseModal>
    )

}