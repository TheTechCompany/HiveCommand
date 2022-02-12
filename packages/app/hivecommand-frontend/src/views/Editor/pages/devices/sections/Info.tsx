import { DeviceUnitModal } from '../../../../../components/modals/device-units';
import { Box, Text } from 'grommet';
import React, { useContext, useState } from 'react';
import { ListBox } from '../../../../../components/ListBox';
import { DeviceSingleContext } from '../context';
import { useConfigureProgramPlaceholder } from '@hive-command/api';

export const InfoSection = (props) => {
    const { device, programId, deviceId } = useContext(DeviceSingleContext);

    const [ unitModalOpen, openUnitModal ] = useState(false);

    const [ selectedState, setSelectedState ] = useState(undefined)
    const [ selectedStateConfig, setSelectedStateConfig ] = useState(undefined)
	const configurePlaceholderState = useConfigureProgramPlaceholder(programId, deviceId)

    
    const getUnits = (item: any) => {
        let config = device.units?.find((a) => a.state.id == item.id)

        if(config?.inputUnit || config?.displayUnit){
            return config.displayUnit ? config.displayUnit : config?.inputUnit
        }
        return item.units
    }
    console.log({ device })
    return (
        <>
        <DeviceUnitModal  
            open={unitModalOpen}
            stateItem={selectedState}
            selected={selectedStateConfig}
            onSubmit={(units) => {
                console.log({units})

                configurePlaceholderState({
                    id: units.id,
                    inputUnit: units.inputUnit,
                    displayUnit: units.displayUnit,
                    state: selectedState.id
                }).then(() => {
                    openUnitModal(false)
                })
            }}
            onClose={() => {
                openUnitModal(false)
            }}  
             />
        <Box flex direction='row' gap='xsmall'>
            <ListBox
                label="State"
                data={device?.type?.state || []}
                onItemEdit={(item) => {
                    setSelectedState(item)
                    let config = device.units?.find((a) => a.state.id == item.id)
                    setSelectedStateConfig(config)

                    openUnitModal(true)
                }}
                renderItem={(item) => {
                    return (<Text>{item.key} {getUnits(item) ? `- ${getUnits(item)}` : ''}</Text>)
                }}
            />
            <ListBox
                label="Actions"
                data={device?.type?.actions || []}
                renderItem={(item) => (
                    <Text>{item.key}</Text>
                )} />
        </Box>
        </>
    )
}