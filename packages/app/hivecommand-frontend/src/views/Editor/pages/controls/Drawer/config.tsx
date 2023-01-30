import { BumpInput } from "@hexhive/ui";
import { HMIGroupModal } from "../../../../../components/modals/hmi-group";
import { Autocomplete, Box, Checkbox, FormControlLabel, IconButton, InputAdornment, Select, TextField, Typography } from "@mui/material";
import { TableView as Aggregate, TripOrigin, RotateLeft, RotateRight, Remove as Subtract, Add, Javascript } from '@mui/icons-material';
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useAssignHMINode, useUpdateHMIGroup, useUpdateHMINode } from "@hive-command/api";
import { useHMIContext } from "../context";
import { FunctionArgumentsModal } from "../../../../../components/modals/function-arguments";
import { MenuItem } from "@mui/material";
import { FormControl } from "@mui/material";
import { InputLabel } from "@mui/material";
import { FormGroup } from "@mui/material";
import { ScriptEditorModal } from "../../../../../components/script-editor";
// import { HMICanvasContext } from "../context";

export interface ConfigMenuProps {
    nodes?: any[]
}

export const ConfigMenu : React.FC<ConfigMenuProps> = (props) => {


    const [ aggregate, setAggregate ] = useState<any>()
    const [ modalOpen, openModal ] = useState<boolean>(false);

    // const { interfaces } = useContext(HMICanvasContext)

    const { programId, interfaces, refetch, selected, nodes, devices, variables } = useHMIContext();

    const updateHMIGroup = useUpdateHMIGroup(programId)
    const assignHMINode = useAssignHMINode(programId)
    const updateHMINode = useUpdateHMINode(programId)

    const item = nodes?.find((a) => a.id == selected.id);

    const options = item?.extras?.options || {};

    const [ state, setState ] = useState<any>([])

    useEffect(() => {
        let  newState = Object.keys(options).map((optionKey) => ({key: optionKey, value: item?.options?.[optionKey]}));

        setState(newState)
    }, [selected, options])

    const [ updateBouncer, setUpdateBouncer ] = useState<any>(null);

    const updateState = (key: string, value: any) => {
        setState((state) => {
            let ix = state.map((x) => x.key).indexOf(key)
            state[ix].value = value;
            return state;
        })

        if(updateBouncer){
            clearTimeout(updateBouncer)
            setUpdateBouncer(null)
        }
        setUpdateBouncer(
            setTimeout(() => {
                updateHMINode(selected.id, {options: state.reduce((prev, curr) => ({...prev, [curr.key]: curr.value}), {})}).then((r) => {
                    refetch?.()
                })
            }, 500)
        )

    }

    const [ templateValue, setTemplateValue ] = useState('');


    // console.log({devices})



    return (

        <Box
            sx={{padding: '6px'}}
            >

          
{/*                 
            <FunctionArgumentsModal
                interfaces={interfaces}
                function={functionArgs}
                open={Boolean(functionArgs)}
                onSubmit={(args) => {

                    updateState(functionOpt, {fn: functionArgs.id, args})

                    setFunctionArgs(null)
                    setFunctionOpt(null)
                }}
                onClose={() => {
                    setFunctionArgs(null)
                    setFunctionOpt(null)
                }} /> */}

            <HMIGroupModal
                devices={devices}
                base={aggregate}
                open={modalOpen}
                onSubmit={(item) => {
                    

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


    
            
            <Box sx={{display :'flex', padding: '6px'}}>
                <Typography>Config</Typography>
                {/* <Button
                    onClick={() => {
                        openModal(true)
                        setAggregate(item)
                    }}
                    plain
                    hoverIndicator
                    style={{ padding: 6, borderRadius: 3 }}
                    icon={<Aggregate />} /> */}
            </Box>
            {/* <FormControl sx={{marginTop: '6px', marginBottom: '6px'}} fullWidth size="small">
                <InputLabel>Device</InputLabel>
                <Select
                    label="Device"
                    // valueKey={{ reduce: true, key: "id" }}
                    // labelKey="name"
                    value={item?.extras?.devicePlaceholder?.id}
                    onChange={(evt) => {
                        assignHMINode(selected.id, evt.target.value).then(() => {
                            refetch()
                        })
                    }}
                    // options={devices.filter((a) => a.type?.name.replace(/ /, '').indexOf(item?.extras?.iconString) > -1)}
                    placeholder="Device">
                    {assignableDevices?.map((device) => (
                        <MenuItem value={device.id}>{device.type?.tagPrefix}{device.tag}</MenuItem>
                    ))}    
                </Select>
            </FormControl>
            */}

            {/* <Box>
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
            </Box> */} 
            <TextField
                sx={{marginBottom: '6px', marginTop: '6px'}}
                fullWidth
                size="small"
                label="X"
                value={item?.x}
                onChange={(e) => {
                    updateHMINode(selected.id, { x: parseFloat(e.target.value) }).then(() => {
                        refetch()
                    })
                }}
                type="number" />
            <TextField
                sx={{marginBottom: '6px', marginTop: '6px'}}
                fullWidth
                size="small"
                label="Y"
                value={item?.y}
                onChange={(e) => {
                    updateHMINode(selected.id, { y: parseFloat(e.target.value) }).then(() => {
                        refetch()
                    })
                }}
                type="number" />
            <TextField 
                sx={{marginBottom: '6px', marginTop: '6px'}}
                fullWidth
                size="small"
                label="Width" 
                value={item?.width} 
                onChange={(e) => {
                    updateHMINode(selected.id, { width: parseInt(e.target.value) }).then(() => {
                        refetch()
                    })
                }}
                type="number"  />
            <TextField 
                sx={{marginBottom: '6px', marginTop: '6px'}}
                fullWidth
                size="small"
                label="Height" 
                value={item?.height} 
                onChange={(e) => {
                    updateHMINode(selected.id, { height: parseInt(e.target.value) }).then(() => {
                        refetch()
                    })
                }}
                type="number" />

            <TextField 
                sx={{marginBottom: '6px', marginTop: '6px'}}
                fullWidth
                size="small"
                label="Scale X" 
                value={item?.extras?.scaleX} 
                onChange={(e) => {
                    updateHMINode(selected.id, { scaleX: parseFloat(e.target.value) }).then(() => {
                        refetch()
                    })
                }}
                type="number" />

            <TextField 
                sx={{marginBottom: '6px', marginTop: '6px'}}
                fullWidth
                size="small"
                label="Scale Y" 
                value={item?.extras?.scaleY} 
                onChange={(e) => {
                    updateHMINode(selected.id, { scaleY: parseFloat(e.target.value) }).then(() => {
                        refetch()
                    })
                }}
                type="number" />

            <TextField
                sx={{marginBottom: '6px', marginTop: '6px'}}
                fullWidth
                type="number"
                size="small"
                label="Z Index"
                value={item?.extras?.zIndex}
                onChange={(e) => {
                    updateHMINode(selected.id, { zIndex: parseFloat(e.target.value)}).then(() => {
                        refetch()
                    })
                }} />
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

            {/* <BumpInput
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
                            width: 
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

                }} /> */}
        </Box>

    )
}