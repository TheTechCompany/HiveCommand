import { BaseModal, FormControl, FormInput } from "@hexhive/ui";

import { Types } from '@hive-command/data-types'
import { useEffect, useState } from "react";

export interface VariableModalProps {
    open: boolean;
    selected?: any;
    onClose?: () => void;
    onSubmit?: (variable) => void;
    onDelete?: () => void;
}

export const VariableModal = (props: VariableModalProps) => {

    const [variable, setVariable] = useState<{
        name?: string;
        type?: string;
        defaultValue?: string;
    }>({})

    const updateKey = (key: string, value: string) => {
        setVariable({
            ...variable,
            [key]: value
        })
    }

    const submit = () => {
        props.onSubmit?.(variable)
    }

    useEffect(() => {
        setVariable({
            ...props.selected
        })
    }, [props.selected])

    return (
        <BaseModal
            title="Variable"
            open={props.open}
            onClose={props.onClose}
            onSubmit={submit}
            onDelete={props.selected && props.onDelete}
            >
            <FormInput 
                value={variable.name}
                onChange={(value) => updateKey('name', value)}
                placeholder="Variable Name" />
            <FormControl 
                value={variable.type}
                onChange={(value) => updateKey('type', value)}
                placeholder="Variable Type" 
                options={Object.keys(Types).map((x) => ({label: x}))} 
                labelKey={'label'}
                valueKey={'label'} />
            <FormInput 
                value={variable.defaultValue}
                onChange={(value) => updateKey('defaultValue', value)}
                placeholder="Default Value" />
        </BaseModal>
    )
}