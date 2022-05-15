
import React, { useEffect, useState } from "react";
import { BaseModal, FormControl, FormInput } from '@hexhive/ui';
import { Box, TextInput } from "grommet";

export interface ConditionModalProps {
    devices: any[];
    variables: any[];

    open: boolean;
    selected?: any;
    onClose?: () => void;
    onSubmit?: (condition) => void;
    onDelete?: () => void;
}

export const ProgramConditionModal : React.FC<ConditionModalProps> = (props) => {

    const [condition, setCondition] = useState<{
        inputDevice?: string;
        inputDeviceKey?: string;
        comparator?: string;
        assertion?: {
            type: string,
            value?: string,
            setpoint?: string,
            variable?: string
        };
    }>({
        assertion: {
            type: 'value'
        }
    });


    useEffect(() => {
        setCondition({
            ...props.selected,
            inputDevice: props.selected?.inputDevice?.id,
            inputDeviceKey: props.selected?.inputDeviceKey?.id,
            assertion: {
                type: props.selected?.assertion?.type || 'value',
                value: props.selected?.assertion?.value,
                setpoint: props.selected?.assertion?.setpoint?.id,
                variable: props.selected?.assertion?.variable?.id
            }
        })
    }, [props.selected]);


    const updateKey = (key: string, value: string) => {
        
        setCondition({
            ...condition,
            [key]: value
        })
    }

    const submit = () => {
        props.onSubmit?.(condition)
    }

    const renderAssertionInput = () => {
        switch(condition.assertion?.type){
            case 'value':
                return (
                    <TextInput 
                        value={condition.assertion?.value}
                        onChange={(e) => {
                            setCondition({
                                ...condition,
                                assertion: {
                                    ...condition.assertion,
                                    value: e.target.value
                                }
                            })
                        }}
                        placeholder="Value" />
                )
            case 'setpoint':
                return (
                    <FormControl 
                        placeholder="Setpoint"
                        labelKey="name"
                        valueKey="id"
                        onChange={(value) => {
                            setCondition({
                                ...condition,
                                assertion: {
                                    ...condition.assertion,
                                    setpoint: value
                                }
                            })
                        }}
                        value={condition.assertion?.setpoint}
                        options={props.devices?.find((a) => a.id == condition.inputDevice)?.setpoints} />
                )
            case 'variable':
                return (
                    <FormControl 
                        placeholder="Variable" 
                        labelKey="name"
                        valueKey="id"
                        onChange={(value) => {
                            setCondition({
                                ...condition,
                                assertion: {
                                    ...condition.assertion,
                                    variable: value
                                }
                            })
                        }}
                        value={condition.assertion?.variable}
                        options={props.variables} />
                )
        }
    }

    return (
        <BaseModal
            title="Condition"
            open={props.open}
            onClose={props.onClose}
            onSubmit={submit}
            onDelete={props.selected && props.onDelete}
            >
            <FormControl 
                value={condition.inputDevice}
                onChange={(value) => updateKey('inputDevice', value)}
                options={props.devices}
                labelKey="name"
                valueKey="id"
                placeholder="Device" />
            <FormControl 
                value={condition.inputDeviceKey}
                onChange={(value) => updateKey('inputDeviceKey', value)}
                placeholder="Device State" 
                options={props.devices?.find((a) => a.id == condition.inputDevice)?.type?.state} 
                labelKey={'key'}
                valueKey={'id'} />
            <FormInput 
                placeholder="Comparison"
                value={condition.comparator}
                onChange={(value) => updateKey('comparator', value)} />
            
            <FormControl 
                value={condition.assertion?.type}
                onChange={(value) => {
                    setCondition({
                        ...condition,
                        assertion: {
                            ...condition.assertion,
                            type: value
                        }
                    })
                }}
                placeholder="Assertion Type"
                labelKey="label"
                valueKey="value"
                options={[
                    {label: "Value", value: 'value'},
                    {label: "Setpoint", value: 'setpoint'},
                    {label: "Variable", value: 'variable'},
                ]} />

            <Box pad={{top: 'xsmall'}}>
                {renderAssertionInput()}
            </Box>

        </BaseModal>
    )

}