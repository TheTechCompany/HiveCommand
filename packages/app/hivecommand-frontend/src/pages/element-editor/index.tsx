import { gql, useApolloClient, useQuery } from "@apollo/client";
import { InfiniteCanvas } from "@hexhive/ui";
import { Box, Divider, IconButton, InputAdornment, Paper, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { HMINodeFactory } from "../../components/hmi-node";
import { CanvasStyle } from "../../style";
import * as HMIIcons from '../../assets/hmi-elements'
import { useEffect } from "react";
import { Save } from "@mui/icons-material";
import { useUpdateElement } from "@hive-command/api";

export const ElementEditor = (props) => {

    const [ edited, setEdited ] = useState(false)
    const { id } = useParams()
        
    const { data } = useQuery(gql`
        query Elements {
            commandInterfaceDevices {
                id
                name
                width
                height
                ports {
                    key
                    x
                    y
                    rotation
                 
                }
            }
        }
    `)

    const client = useApolloClient()

    const refetch = () => {
        client.refetchQueries({include: ['Elements']})
    }
    const updateElement = useUpdateElement();

    const element = data?.commandInterfaceDevices?.find((a) => a.id == id);

    const [ editDevice, setEditDevice ] = useState<{
        width?: number,
        height?: number,
        scaleX?: number,
        scaleY?: number,
        name?: string,
        rotation?: number,
        ports?: {key: string, x: number, y: number, rotation: number}[] 
    }>({})

    useEffect(() => {
        setEditDevice(element)
    }, [element])

    
    return (
        <Paper sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <Box sx={{padding: '6px', bgcolor: 'secondary.main', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Typography color="primary.light">{element?.name}</Typography>
                <IconButton
                    onClick={() => {
                        updateElement(id, {name: editDevice.name, ports: editDevice.ports.map((x) => ({x: x.x, y: x.y, rotation: x.rotation, key: x.key}))}).then(() => {
                            setEdited(false)
                            refetch()
                        })
                    }}
                    disabled={!edited} 
                    size="small" 
                    sx={{color: 'primary.light'}}>
                    <Save />
                </IconButton>
            </Box>
            <Box sx={{flex: 1, display: 'flex'}}>
                <InfiniteCanvas 
                    factories={[new HMINodeFactory()]}
                    nodes={[
                        {
                            id: 'editor-node',
                            type: "hmi-node",
                            x: 500,
                            y: 200,
                            width: `${editDevice?.width}px`,
                            height: `${editDevice?.height}px`,
                            // width: `${x?.type?.width || 50}px`,
                            // height: `${x?.type?.height || 50}px`,
                            extras: {
                            
                                // options: props.deviceValues.find((a) => a?.devicePlaceholder?.name == x?.devicePlaceholder?.name)?.values,
                                // configuration: props.deviceValues.find((a) => a?.devicePlaceholder?.name == x?.devicePlaceholder?.name)?.conf.reduce((prev,curr) => ({...prev, [curr.conf.key]: curr.value}), {}),
                                ports: (editDevice?.ports || []).map((x) => ({...x, id: x.key})),
                                rotation: editDevice?.rotation || 0,
                                scaleX: editDevice?.scaleX || 1,
                                scaleY: editDevice?.scaleY || 1,
                                // color: x.type == 'BallValve' || x.type == "DiaphragmValve" ? (props.deviceValues.find((a) => a.devicePlaceholder.name == x.devicePlaceholder.name)?.values == "false" ? '0deg' : '60deg') : '0deg',
                                // devicePlaceholder: x.devicePlaceholder,
                                iconString: editDevice?.name,
                                icon: HMIIcons[editDevice?.name],
                            },
                        }
                    ]}
                    style={CanvasStyle} />
                <Box sx={{width: '15vw', display: 'flex', flexDirection: 'column'}}>
                    <Box sx={{padding: '3px', bgcolor: 'secondary.light'}}>
                        <Typography color={"primary.light"}>Ports</Typography>
                    </Box>
                    <Box sx={{ padding: '6px', flex: 1}}>
                    {editDevice?.ports?.map((port) => (
                        <>
                        <Box sx={{'& *': {marginBottom: '4px'}}}>
                            <Typography>{port.key}</Typography>
                            <Box sx={{display: 'flex'}}>
                                <TextField 
                                    type="number"
                                    label={`X`} 
                                    value={port.x} 
                                    InputProps={{endAdornment: <InputAdornment position="end">px</InputAdornment>}} 
                                    fullWidth 
                                    onChange={(e) => {
                                        let device = Object.assign({}, editDevice);

                                        let ix = device.ports.map((x) => x.key).indexOf(port.key)
                                        let ports = device.ports.slice()

                                        // ports[ix].x = parseFloat(e.target.value);
                                        setEdited(true)
                                        setEditDevice({
                                            ...device,
                                            ports: [...(ports.slice(0, ix)), {...ports[ix], x: parseFloat(e.target.value)}, ...(ports.slice(ix + 1, ports.length))]
                                        })
                                    }}
                                    size="small" />
                                <TextField 
                                    type="number"
                                    label={`Y`} 
                                    value={port.y} 
                                    onChange={(e) => {
                                        let device = Object.assign({}, editDevice);

                                        let ix = device.ports.map((x) => x.key).indexOf(port.key)
                                        let ports = device.ports.slice()
                                        // ports[ix].y = parseFloat(e.target.value);
                                        setEdited(true)
                                        
                                        setEditDevice({
                                            ...device,
                                            ports: [...(ports.slice(0, ix)), {...ports[ix], y: parseFloat(e.target.value)}, ...(ports.slice(ix + 1, ports.length))]
                                            
                                        })   
                                    
                                    }}
                                    InputProps={{endAdornment: <InputAdornment position="end">px</InputAdornment>}} 
                                    fullWidth 
                                    size="small" />
                            </Box>
                            <Box>
                                <TextField 
                                    size="small"
                                    fullWidth
                                    label={`Rotation`}
                                    onChange={(e) => {
                                        let device = Object.assign({}, editDevice);

                                        let ix = device.ports.map((x) => x.key).indexOf(port.key)
                                        let ports = device.ports.slice();

                                        // ports[ix].rotation = parseFloat(e.target.value);
                                        setEdited(true)

                                        setEditDevice({
                                            ...device,
                                            ports: [...(ports.slice(0, ix)), {...ports[ix], rotation: parseFloat(e.target.value)}, ...(ports.slice(ix + 1, ports.length))]
                                            
                                        })
                                    }}
                                    value={port.rotation || 0}
                                    InputProps={{endAdornment: <InputAdornment position="end">°</InputAdornment>}} />

                            </Box>
                        </Box>
                        <Divider />
                        </>
                    ))}
                    </Box>
                </Box>
            </Box>
        </Paper>
    )
}