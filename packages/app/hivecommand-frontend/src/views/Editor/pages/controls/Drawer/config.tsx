import { BumpInput } from "@hexhive/ui";
import { HMIGroupModal } from "../../../../../components/modals/hmi-group";
import { Box, Text, Button, Select, CheckBox } from "grommet";
import { TableView as Aggregate, RotateLeft, RotateRight, Remove as Subtract, Add } from '@mui/icons-material';
import React, { useState } from "react";
import { useAssignHMINode, useUpdateHMIGroup, useUpdateHMINode } from "@hive-command/api";
import { useHMIContext } from "../context";

export interface ConfigMenuProps {
    nodes?: any[]
}

export const ConfigMenu : React.FC<ConfigMenuProps> = (props) => {

    const [ aggregate, setAggregate ] = useState<any>()
    const [ modalOpen, openModal ] = useState<boolean>(false);

    const { programId, refetch, selected, nodes, devices } = useHMIContext();

    const updateHMIGroup = useUpdateHMIGroup(programId)
    const assignHMINode = useAssignHMINode(programId)
    const updateHMINode = useUpdateHMINode(programId)

    const item = nodes?.find((a) => a.id == selected.id);

    console.log({selected})

    return (

        <Box
            pad="xsmall"
            gap="xsmall"
            focusIndicator={false}>

            <HMIGroupModal
                devices={devices}
                base={aggregate}
                open={modalOpen}
                onSubmit={(item) => {
                    console.log("HMI GROUP", {item})
                    updateHMIGroup(
                        selected.id,
                        item.nodes.map((x) => ({
                            id: x.id,
                            x: x.x,
                            y: x.y,
                            rotation: x.extras?.rotation || 0,
                            scaleX: x.extras?.scaleX || 1,
                            scaleY: x.extras?.scaleY || 1,
                            devicePlaceholder: x?.devicePlaceholder?.id || x.extras?.device,
                            type: props.nodes.find((a) => a.extras.icon == x.extras.iconStr)?.id
                        })),
                        item.ports.map((port) => ({
                            id: port.id,
                            key: port.key,
                            x: port.x,
                            y: port.y,
                            rotation: port.rotation,
                            length: port.height

                        }))
                    ).then(() => {
                        openModal(false);
                        refetch()
                    })
                }}
                onClose={() => openModal(false)}
                nodeMenu={props.nodes} />

            <Box justify="between" align="center" direction="row">
                <Text>Config</Text>
                <Button
                    onClick={() => {
                        openModal(true)
                        setAggregate(item)
                    }}
                    plain
                    hoverIndicator
                    style={{ padding: 6, borderRadius: 3 }}
                    icon={<Aggregate />} />
            </Box>
            <Select
                valueKey={{ reduce: true, key: "id" }}
                labelKey="name"
                value={item?.extras?.devicePlaceholder?.id}
                onChange={({ value }) => {
                    assignHMINode(selected.id, value).then(() => {
                        refetch()
                    })
                }}
                options={devices.filter((a) => a.type?.name.replace(/ /, '').indexOf(item?.extras?.iconString) > -1)}
                placeholder="Device" />

            <Box justify="end" direction="row">
                <CheckBox
                    checked={item?.extras?.showTotalizer}
                    onChange={(e) => {
                        // updateHMINodeTotalizer({
                        //     args: {
                        //         id: selected.id,
                        //         totalize: e.target.checked
                        //     }
                        // }).then(() => {
                        //     refetch()
                        // })
                    }}
                    reverse
                    label="Show Totalizer" />
            </Box>
            <BumpInput
                placeholder="Rotation"
                type="number"
                leftIcon={<RotateLeft  fontSize="small"  />}
                rightIcon={<RotateRight  fontSize="small" />}
                value={item?.extras?.rotation}
                onLeftClick={() => {
                    updateHMINode(selected.id, { rotation: (item?.extras?.rotation || 0) - 90 }).then(() => {
                        refetch()
                    })
                }}
                onRightClick={() => {
                    updateHMINode(
                        selected.id,
                        { rotation: (item?.extras?.rotation || 0) + 90 }
                    ).then(() => {
                        refetch()
                    })
                }}
                onChange={(e) => {
                    updateHMINode(
                        selected.id,
                        { rotation: parseFloat(e) }
                    ).then(() => {
                        refetch()
                    })

                }}
            />

            <BumpInput
                placeholder="Scale X"
                type="number"
                leftIcon={<Subtract fontSize="small"   />}
                rightIcon={<Add fontSize="small"  />}
                value={item?.extras?.scaleX}
                onLeftClick={() => {
                    console.log("left click", item.extras)
                    
                    updateHMINode(
                        selected.id,
                        {
                            scale: {
                                x: parseFloat(item?.extras?.scaleX || 0) - 1
                            }
                        }
                    ).then(() => {
                        refetch()
                    })
                }}
                onRightClick={() => {
                    updateHMINode(
                        selected.id,
                        {
                            scale: {
                                x: parseFloat(item?.extras?.scaleX || 0) + 1
                            }
                        }
                    ).then(() => {
                        refetch()
                    })
                }}
                onChange={(e) => {
                    updateHMINode(
                        selected.id,
                        { scale: { x: parseFloat(e) } }
                    ).then(() => {
                        refetch()
                    })

                }}
            />
            <BumpInput
                placeholder="Scale Y"
                type="number"
                leftIcon={<Subtract fontSize="small"  />}
                rightIcon={<Add fontSize="small"  />}
                value={item?.extras?.scaleY}
                onLeftClick={() => {
                    updateHMINode(
                        selected.id,
                        { scale: { y: parseFloat(item?.extras?.scaleY || 0) - 1 } }
                    ).then(() => {
                        refetch()
                    })
                }}
                onRightClick={() => {
                    updateHMINode(
                        selected.id,
                        { scale: { y: parseFloat(item?.extras?.scaleY || 0) + 1 } }
                    ).then(() => {
                        refetch()
                    })
                }}
                onChange={(e) => {
                    updateHMINode(
                        selected.id,
                        { scale: { y: parseFloat(e) } }
                    ).then(() => {
                        refetch()
                    })

                }} />

            <Box>

            </Box>
        </Box>

    )
}