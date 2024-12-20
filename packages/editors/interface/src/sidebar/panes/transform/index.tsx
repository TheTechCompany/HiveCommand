import { BumpInput } from "@hexhive/ui";
import { Box, TextField, Typography } from "@mui/material";
import { RotateLeft, RotateRight, Remove as Subtract, Add, Javascript } from '@mui/icons-material';
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Node } from 'reactflow';
import { useInterfaceEditor } from "../../../context";
// import { HMICanvasContext } from "../context";
import { merge } from 'lodash';

export interface TransformPaneProps {

    onNodeUpdate?: (update: any) => void;
}

export const TransformPane : React.FC<TransformPaneProps> = (props) => {

    const { selected, nodes } = useInterfaceEditor()

    const [ selectedNode, setSelectedNode ] = useState<Node | undefined>(nodes?.find((a) => a.id == selected?.nodes?.[0]?.id));

    
    useEffect(() => {
        
        console.log({nodes, selected});

        setSelectedNode(nodes?.find((a) => a.id == selected?.nodes?.[0]?.id))

    }, [ JSON.stringify(nodes), JSON.stringify(selected) ])
    // const selectedNode = nodes?.find((a) => a.id == selected?.nodes?.[0]?.id)
    

    const options = selectedNode?.data?.options || {};

    const configuredOptions = selectedNode?.data?.configuredOptions || {};

    const [ state, setState ] = useState<any>([])

    useEffect(() => {
        let  newState = Object.keys(options).map((optionKey) => ({key: optionKey, value: configuredOptions?.[optionKey]}));

        setState(newState)
    }, [ JSON.stringify(options), JSON.stringify(configuredOptions) ])


    const updateState = (kv: any) => {
        // setState((state: any[]) => {

        //     Object.keys(kv).map((key) => {
        //         let value = kv[key];

        //         let ix = state.map((x) => x.key).indexOf(key)
        //         state[ix].value = value;
        //     })

        //     return state;
        // })
        setSelectedNode(merge({}, selectedNode, kv))

        props.onNodeUpdate?.({
            ...kv,
            // data: {
            //     options: state.reduce((prev: any, curr: any) => ({...prev, [curr.key]: curr.value}), {})
            // }
        })


    }

    const [ templateValue, setTemplateValue ] = useState('');


    // console.log({devices})



    return (

        <Box
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

            {/* <HMIGroupModal
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
                nodeMenu={props.nodes} /> */}


    
            
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
                value={selectedNode?.position?.x || ''}
                onChange={(e) => {
                    updateState({ position: { x: parseFloat(e.target.value) } })
                }}
                type="number" />
            <TextField
                sx={{marginBottom: '6px', marginTop: '6px'}}
                fullWidth
                size="small"
                label="Y"
                value={selectedNode?.position?.y || ''}
                onChange={(e) => {
                    updateState({ position: { y: parseFloat(e.target.value) } })
                }}
                type="number" />
            <TextField 
                sx={{marginBottom: '6px', marginTop: '6px'}}
                fullWidth
                size="small"
                label="Width" 
                value={selectedNode?.data?.width || ''} 
                onChange={(e) => {
                    updateState({ data: { width: parseInt(e.target.value) } })
                }}
                type="number"  />
            <TextField 
                sx={{marginBottom: '6px', marginTop: '6px'}}
                fullWidth
                size="small"
                label="Height" 
                value={selectedNode?.data?.height || ''} 
                onChange={(e) => {
                    updateState({ data: { height: parseInt(e.target.value) } })
                }}
                type="number" />

            <TextField 
                sx={{marginBottom: '6px', marginTop: '6px'}}
                fullWidth
                size="small"
                label="Scale X" 
                value={selectedNode?.data?.scaleX || ''} 
                onChange={(e) => {
                    updateState({ data: { scaleX: parseFloat(e.target.value) } })
                }}
                type="number" />

            <TextField 
                sx={{marginBottom: '6px', marginTop: '6px'}}
                fullWidth
                size="small"
                label="Scale Y" 
                value={selectedNode?.data?.scaleY || ''} 
                onChange={(e) => {
                    updateState({ data: { scaleY: parseFloat(e.target.value) } })
                }}
                type="number" />

            <TextField
                sx={{marginBottom: '6px', marginTop: '6px'}}
                fullWidth
                type="number"
                size="small"
                label="Z Index"
                value={selectedNode?.data?.zIndex || ''}
                onChange={(e) => {
                    updateState({ data: { zIndex: parseFloat(e.target.value) } })
                }} />
            <BumpInput
                placeholder="Rotation"
                type="number"
                leftIcon={<RotateLeft  fontSize="small"  />}
                rightIcon={<RotateRight  fontSize="small" />}
                value={selectedNode?.data?.rotation || 0}
                onLeftClick={() => {
                    updateState({ data: { rotation: (selectedNode?.data?.rotation || 0) - 90 } })
                }}
                onRightClick={() => {
                    updateState(
                        { data: {
                             rotation: (selectedNode?.data?.rotation || 0) + 90 
                            }
                        }
                    )
                }}
                onChange={(e) => {
                    updateState(
                        { data: {
                                rotation: parseFloat(e)
                            }
                        }
                    )

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