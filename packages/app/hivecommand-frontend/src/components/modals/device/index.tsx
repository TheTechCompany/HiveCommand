import React, { useEffect, useState } from 'react';
import { BaseModal } from '../base';
import { TextInput, Text, Box, Select } from 'grommet';
import { nanoid } from 'nanoid';

export interface DeviceModalProps {
    open: boolean;
    
    onClose?: () => void;
    onSubmit?: (data: any) => void;
    selected?: any; // change to device interface

    programs?: any[]

}

export const DeviceModal : React.FC<DeviceModalProps> = (props) => {

    const [ device, setDevice ] = useState<any>({
        name: '',
        program: '',
        network_name: nanoid().substring(0, 8)
    })

    const onClose = () => {
        props.onClose?.()

        setDevice({
            name: '',
            program: {},
            network_name: nanoid().substring(0, 8)
        })
      
    }

    const onSubmit = () => {
        if(device.name) props.onSubmit?.(device) 
    }


    useEffect(() => {
        if(props.selected){
            setDevice({
                ...props.selected,
                // program: props.programs?.find((a) => a.id == props.selected.program)
            })
        
        }
    }, [props.selected])

    return (
        <BaseModal  
            open={props.open}
            title={`${props.selected?.id ? 'Edit' : 'Add'} Device`}
            onClose={onClose}
            onSubmit={onSubmit}
            >
            <TextInput 
                value={device?.name}
                onChange={(e) => setDevice({...device, name: e.target.value})}
                placeholder="Device Name"
                 />

            <Box 
                round="xsmall"
                    justify="start"
                    pad={{right: 'medium'}} 
                    align="center"
                     direction="row" 
                     border={{size:"small"}}>
                    <Box flex>
                    <TextInput 
                        style={{flex: 1}}
                        focusIndicator={false}
                        textAlign="center" 
                        plain 
                        value={device.network_name}
                        onChange={(e) => setDevice({...device, network_name: e.target.value})}
                        placeholder="Network name" />

                    </Box>
                
                    <Box direction="row" justify='start'>
                        <Text size="large">.hexhive.io</Text>

                    </Box>
                </Box>

               
                <Select
                    placeholder="Program"
                    options={props.programs || []}
                    value={device.activeProgram || {}}
                    labelKey={"name"}
                    valueKey={{key: "id", reduce: false}}
                    onChange={({value, option}) => setDevice({...device, activeProgram: option})} />
                    
         
        </BaseModal>
    )
}