import { BaseModal } from '@hexhive/ui';
import { Text, TextInput } from 'grommet'
import React, { useEffect, useState } from 'react';

export const DeviceUnitModal = (props) => {

    const [ unitConfiguration, setUnitConfiguration ] = useState<{
        id?: string
        inputUnit?: string,
        displayUnit?: string
    }>({});

    useEffect(() => {
        setUnitConfiguration({
            id: props.selected?.id,
            inputUnit: props.selected?.inputUnit,
            displayUnit: props.selected?.displayUnit
        })
    }, [props.selected])
    
    const submit = () => {
        let input = (unitConfiguration.inputUnit && unitConfiguration.inputUnit.length > 0) ? unitConfiguration.inputUnit : undefined;
        let display = (unitConfiguration.displayUnit && unitConfiguration.displayUnit.length > 0) ? unitConfiguration.displayUnit : undefined;

        let obj : any = {};
        if(input){
            obj.inputUnit = input;
        }

        if(display){
            obj.displayUnit = display;
        }

        props.onSubmit?.(obj)
    }

    return (
        <BaseModal
            title='Configure Device Units'
            onClose={props.onClose}
            onSubmit={submit}
            open={props.open}
            >
            <Text>Default Units: {props.stateItem?.units}</Text>

            <TextInput 
                value={unitConfiguration?.inputUnit}
                onChange={(e) => {
                    setUnitConfiguration({
                        ...unitConfiguration,
                        inputUnit: e.target.value
                    })
                }}
                placeholder="Input Units" />
            <TextInput 
                value={unitConfiguration?.displayUnit}
                onChange={(e) => {
                    setUnitConfiguration({
                        ...unitConfiguration,
                        displayUnit: e.target.value
                    })
                }}
                placeholder="Display Units" />
        </BaseModal>
    )
}