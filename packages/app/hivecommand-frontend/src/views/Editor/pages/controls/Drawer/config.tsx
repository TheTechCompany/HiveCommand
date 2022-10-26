import { BumpInput } from "@hexhive/ui";
import { HMIGroupModal } from "../../../../../components/modals/hmi-group";
import { Autocomplete, Box, Checkbox, FormControlLabel, InputAdornment, Select, TextField, Typography } from "@mui/material";
import { TableView as Aggregate, TripOrigin, RotateLeft, RotateRight, Remove as Subtract, Add } from '@mui/icons-material';
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useAssignHMINode, useUpdateHMIGroup, useUpdateHMINode } from "@hive-command/api";
import { useHMIContext } from "../context";
import { FunctionArgumentsModal } from "../../../../../components/modals/function-arguments";
import { MenuItem } from "@mui/material";
import { FormControl } from "@mui/material";
import { InputLabel } from "@mui/material";
import { FormGroup } from "@mui/material";
// import { HMICanvasContext } from "../context";

export interface ConfigMenuProps {
    nodes?: any[]
}

export const ConfigMenu : React.FC<ConfigMenuProps> = (props) => {

    const functions = [
        {
            id: 'change-view',
            label: "Change View",
            args: [
                {
                    key: 'view',
                    type: 'View'
                }
            ]
        }
    ]

    const [ functionArgs, setFunctionArgs ] = useState<any>(null);
    const [ functionOpt, setFunctionOpt ] = useState<any>()

    const [ aggregate, setAggregate ] = useState<any>()
    const [ modalOpen, openModal ] = useState<boolean>(false);

    // const { interfaces } = useContext(HMICanvasContext)

    const { programId, interfaces, refetch, selected, nodes, devices } = useHMIContext();

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

    const renderConfigInput = ({type, value, label}: {type: 'Template' | 'Function' | 'String' | 'Number' | 'Boolean', value: any, label: string}) => {
        switch(type){
            case 'Boolean':
                return (
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <input 
                        checked={Boolean(value)}
                        type="checkbox" 
                        onChange={(evt) => {
                            updateState(label, evt.target.checked)
                        }} />

                        <Typography>{label}</Typography>
                    </Box>
                )
            case 'Function':
                return (
                    <Autocomplete 
                        disablePortal
                        options={functions}
                        value={functions?.find((a) => a.id == value?.fn) || {label: ""}}
                        
                        onChange={(event, newValue) => {
                            if(!newValue){
                                updateState(label, null)
                            }else{
                                setFunctionArgs(newValue);
                                setFunctionOpt(label)
                            }
                        }}
                        getOptionLabel={(option) => typeof(option) == "string" ? option : option.label}
                        // isOptionEqualToValue={(option, value) => option.id == value.id}
                        renderInput={(params) => 
                            <TextField 
                                {...params} 
                                label={label}
                                />
                        }
                        // value={value || ''}
                        // onChange={(e) => {
                        //     updateState(label, e.target.value)
                        // }}
                        size="small" 
                        // label={label} />
                        />
                );
            case 'String':
                return (
                    <TextField 
                        value={value || ''}
                        onChange={(e) => {
                            updateState(label, e.target.value)
                        }}
                        size="small" 
                        label={label} />
                );
            case 'Number':
                return (
                    <TextField 
                        value={value || ''}
                        type="number"
                        onChange={(e) => {
                            updateState(label, e.target.value)
                        }}
                        size="small" 
                        label={label} />
                );
            case 'Template':
                return (

                    // <Autocomplete
                    //     size="small"
                    //     multiple={true}
                    //     options={[{label: 'BLO701.on'}, {label: 'FIT101.flow'}]}
                    //     inputValue={templateValue}
                    //     onInputChange={(event, value, reason) => {
                    //         if ( event && event.type === 'blur' ) {
                    //             console.log("BLur", value)
                    //               setTemplateValue('');
                    //         } else if ( reason !== 'reset' ) {
                    //             console.log("Non blur", value)
                    //           setTemplateValue(value);
                    //         }
                    //     }}
                    //     getOptionLabel={(option) => typeof(option) == 'string' ? option : option.label }
                    //     renderInput={(params) => (
                            <TextField 
                                label={label}
                                value={value}
                                size="small"
                                onChange={(e) => {
                                    updateState(label, e.target.value)
                                }} />
                        // )} />
                );
            default:
                return (<span>{type} not found in renderConfigInput</span>)
        }
    }

    const assignableDevices = useMemo(() => {

        let devs = devices;

        if(item?.extras?.metadata?.type){
            devs = devs.filter((a) => a.type?.type == item?.extras?.metadata?.type);
        }

        return devs;
        // devices?.filter((a) => a.type?.type?.indexOf(item?.extras?.metadata) > -1)
    }, [devices, item])

    // console.log({devices})

    return (

        <Box
            >

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
                }} />

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


            <Box sx={{
                paddingLeft: '3px',
                paddingRight: '3px'
            }}>
                <FormGroup>
                    {Object.keys(options).map((optionKey) => {

                        const type = options[optionKey];
                        const value = state?.find((a) => a.key == optionKey)?.value;
                        const label = optionKey

                        return (<Box sx={{marginTop: '6px'}}>
                            {renderConfigInput({type, value, label})}
                        </Box>)

                    })}
                </FormGroup>
            </Box>
            
            <Box sx={{display :'flex'}}>
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
            <FormControl sx={{marginTop: '6px', marginBottom: '6px'}} fullWidth size="small">
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