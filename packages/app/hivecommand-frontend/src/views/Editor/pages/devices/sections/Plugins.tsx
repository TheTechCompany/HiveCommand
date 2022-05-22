import { useCreatePlaceholderPlugin, useUpdatePlaceholderPlugin } from '@hive-command/api';
import { Box, Text } from 'grommet';
import React, { useContext, useState } from 'react';
import { ListBox } from '../../../../../components/ListBox';
import { DevicePluginModal } from '../../../../../components/modals/device-plugin';
import { DeviceSingleContext } from '../context';

export const PluginSection = (props) => {
    const { programId, deviceId, device, devices, plugins, flows, refetch } = useContext(DeviceSingleContext);

    const [modalOpen, openModal] = useState(false);

    const [selected, selectPlugin] = useState()

    const createPlaceholderPlugin = useCreatePlaceholderPlugin(programId, deviceId);
    const updatePlaceholderPlugin = useUpdatePlaceholderPlugin(programId, deviceId);
    
    return (
        <Box flex>

            <DevicePluginModal
                selected={selected}
                open={modalOpen}
                onSubmit={(config) => {
                    if(config.id){
                        updatePlaceholderPlugin(config.id, config.plugin, config.rules, config.configuration).then(() => {
                            refetch()
                        })
                    }else{
                        createPlaceholderPlugin(config.plugin, config.rules, config.configuration).then(() => {
                            refetch()
                        })
                    }
                }}
                onClose={() => openModal(false)}
                devices={devices}
                device={device}
                plugins={plugins}
                flows={flows}
            />


            <ListBox
                label="Controllers"
                onAdd={() => openModal(true)}
                data={device?.plugins || []}
                onItemEdit={(item) => { 
                    selectPlugin(item) 
                    openModal(true)
                }}
                renderItem={(item) => {
                    return (
                        <Text size="small">{item.plugin?.name} {item?.rules && `- ${item?.rules?.name}`}</Text>
                    )
                }} />
        </Box>
    )
}