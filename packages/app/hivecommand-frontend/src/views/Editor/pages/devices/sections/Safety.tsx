import { DeviceInterlock } from '../../../../../components/modals/device-interlock';
import { Box, Text } from 'grommet';
import React, { useContext, useState } from 'react';
import { ListBox } from '../../../../../components/ListBox';
import { DeviceSetpointModal } from '../../../../../components/modals/device-setpoint';
import { DeviceSingleContext } from '../context';
import { useCreatePlaceholderDataInterlock, useCreatePlaceholderInterlock, useCreatePlaceholderSetpoint, useDeletePlaceholderDataInterlock, useDeletePlaceholderInterlock, useUpdatePlaceholderDataInterlock, useUpdatePlaceholderInterlock, useUpdatePlaceholderSetpoint } from '@hive-command/api';
import { DeviceDataInterlockModal } from 'app/hivecommand-frontend/src/components/modals/device-data-interlock';

export const SafetySection = (props) => {

    const { programId, variables, device, devices, deviceId, refetch } = useContext(DeviceSingleContext);

    const [selectedInterlock, setSelectedInterlock] = useState<any>()
    const [selectedDataInterlock, setSelectedDataInterlock] = useState<any>()
    const [selectedSetpoint, setSelectedSetpoint] = useState<any>()

    const [interlockModalOpen, openInterlockModal] = useState<boolean>(false);
    const [dataInterlockModalOpen, openDataInterlockModal] = useState<boolean>(false);
    const [setpointModalOpen, openSetpointModal] = useState<boolean>(false);


    const createPlaceholderInterlock = useCreatePlaceholderInterlock(programId, deviceId)
    const updatePlaceholderInterlock = useUpdatePlaceholderInterlock(programId, deviceId)
    const deletePlaceholderInterlock = useDeletePlaceholderInterlock(programId, deviceId)

    const createPlaceholderDataInterlock = useCreatePlaceholderDataInterlock(programId, deviceId)
    const updatePlaceholderDataInterlock = useUpdatePlaceholderDataInterlock(programId, deviceId)
    const deletePlaceholderDataInterlock = useDeletePlaceholderDataInterlock(programId, deviceId)


    const createPlaceholderSetpoint = useCreatePlaceholderSetpoint(programId, deviceId)
    const updatePlaceholderSetpoint = useUpdatePlaceholderSetpoint(programId, deviceId)


    return (
        <>
            <DeviceDataInterlockModal
                open={dataInterlockModalOpen}
                onClose={() => {
                    openDataInterlockModal(false)
                }}
                selected={selectedDataInterlock}
                device={device}
                devices={devices}
                variables={variables}
                onSubmit={(dataInterlock) => {
                    if (dataInterlock.id) {
                        updatePlaceholderDataInterlock(
                            dataInterlock.id,
                            dataInterlock.inputDevice,
                            dataInterlock.inputDeviceKey,
                            dataInterlock.valueType,
                            dataInterlock.comparator,
                            dataInterlock.assertion,
                            dataInterlock.deviceKey
                        ).then(() => {
                            refetch()
                            openInterlockModal(false)

                        })
                    } else {
                        createPlaceholderDataInterlock(
                            dataInterlock.inputDevice,
                            dataInterlock.inputDeviceKey,
                            dataInterlock.valueType,
                            dataInterlock.comparator,
                            dataInterlock.assertion,
                            dataInterlock.deviceKey
                        ).then(() => {
                            refetch();
                            openInterlockModal(false)

                        })
                    }
                }}

                />
         <DeviceInterlock   
            variables={variables}
                devices={devices}
                device={device}
                actions={device?.type?.actions || []}
                open={interlockModalOpen}
                selected={selectedInterlock}
                onClose={() => {
                    openInterlockModal(false)
                }}
                onDelete={() => {
                    deletePlaceholderInterlock(selectedInterlock.id).then(() => {
                        openInterlockModal(false)
                        setSelectedInterlock(undefined)
                        refetch()
                    })
                }}
                onSubmit={(lock) => {
                    if (lock.id) {
                        updatePlaceholderInterlock(
                            lock.id,
                            lock.inputDevice,
                            lock.inputDeviceKey,
                            lock.valueType,
                            lock.comparator,
                            lock.assertion,
                            lock.action,
                            lock.state
                        ).then(() => {
                            refetch()
                            openInterlockModal(false)

                        })
                    } else {
                        createPlaceholderInterlock(
                            lock.inputDevice,
                            lock.inputDeviceKey,
                            lock.valueType,
                            lock.comparator,
                            lock.assertion,
                            lock.action,
                            lock.state
                        ).then(() => {
                            refetch();
                            openInterlockModal(false)

                        })
                    }

                }} />
            <DeviceSetpointModal
                selected={selectedSetpoint}
                onSubmit={(setpoint) => {

                    if (setpoint.id) {
                        updatePlaceholderSetpoint(
                            setpoint.id,
                            setpoint.name,
                            setpoint.type,
                            setpoint.key,
                            setpoint.value
                        ).then(() => {
                            openSetpointModal(false)
                            refetch()
                        })
                    } else {
                        createPlaceholderSetpoint(
                            setpoint.name,
                            setpoint.type,
                            setpoint.key,
                            setpoint.value
                        ).then(() => {
                            openSetpointModal(false)
                            refetch()
                        })
                    }
                }}
                onClose={() => {
                    openSetpointModal(false)
                }}
                stateItems={device?.type?.state}
                open={setpointModalOpen} />
        <Box flex direction='row' gap='xsmall'>
           <Box gap="xsmall" flex>
            <ListBox
                label="Process Interlocks"
                onAdd={() => openInterlockModal(true)}
                data={device?.interlocks || []}
                onItemEdit={(item) => { openInterlockModal(true); setSelectedInterlock(item) }}
                renderItem={(item) => {
                    return (
                        <Text size="small">{item.inputDevice?.name}</Text>
                    )
                }} />
            <ListBox
                label="Data Interlocks"
                onAdd={() => openDataInterlockModal(true)}
                data={device?.dataInterlocks || []}
                onItemEdit={(item) => { openDataInterlockModal(true); setSelectedDataInterlock(item) }}
                renderItem={(item) => {
                    return (
                        <Text size="small">{item.inputDevice?.name}</Text>
                    )
                }} />
            </Box>


            <ListBox
                label="Setpoints"
                onAdd={() => openSetpointModal(true)}
                onItemEdit={(item) => { openSetpointModal(true); setSelectedSetpoint(item) }}
                data={device?.setpoints || []}
                renderItem={(item) => {
                    return (
                        <Text size="small">{item.name}</Text>
                    )
                }} />


        </Box>
        </>
    )
}