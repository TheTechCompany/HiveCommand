import { BumpInput } from "@hexhive/ui";
import { HMIGroupModal } from "../../../../../components/modals/hmi-group";
import { Autocomplete, Box, Checkbox, FormControlLabel, InputAdornment, TextField, Typography } from "@mui/material";
import { TableView as Aggregate, TripOrigin, RotateLeft, RotateRight, Remove as Subtract, Add } from '@mui/icons-material';
import React, { useContext, useEffect, useState } from "react";
import { useAssignHMINode, useUpdateHMIGroup, useUpdateHMINode } from "@hive-command/api";
import { useHMIContext } from "../context";
import { FunctionArgumentsModal } from "../../../../../components/modals/function-arguments";
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
    console.log({state})

    const renderConfigInput = ({type, value, label}: {type: 'Function' | 'String' | 'Number' | 'Boolean', value: any, label: string}) => {
        switch(type){
            case 'Boolean':
                return (
                    <FormControlLabel 
                        label={label} 
                        control={<Checkbox value={value} onChange={(evt) => {
                            updateState(label, evt.target.checked)
                        }} />} />
                )
            case 'Function':
                return (
                    <Autocomplete 
                        disablePortal
                        options={functions}
                        value={functions?.find((a) => a.id == value?.fn) || {label: ""}}
                        
                        onChange={(event, newValue) => {
                            console.log({newValue})
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
            default:
                return (<span>{type} not found in renderConfigInput</span>)
        }
    }

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


            <Box sx={{
                paddingLeft: '3px',
                paddingRight: '3px'
            }}>
                {Object.keys(options).map((optionKey) => {

                    const type = options[optionKey];
                    const value = state?.find((a) => a.key == optionKey)?.value;
                    const label = optionKey

                    return (<Box sx={{marginTop: '6px'}}>
                        {renderConfigInput({type, value, label})}
                    </Box>)

                })}
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
            {/* <Select
                valueKey={{ reduce: true, key: "id" }}
                labelKey="name"
                value={item?.extras?.devicePlaceholder?.id}
                onChange={({ value }) => {
                    assignHMINode(selected.id, value).then(() => {
                        refetch()
                    })
                }}
                options={devices.filter((a) => a.type?.name.replace(/ /, '').indexOf(item?.extras?.iconString) > -1)}
                placeholder="Device" /> */}

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