import { gql, useApolloClient, useQuery } from "@apollo/client";
import { InfiniteCanvas } from "@hexhive/ui";
import { Box, Button, Divider, IconButton, InputAdornment, List, ListItem, Menu, MenuItem, Paper, TextField, Typography } from "@mui/material";
import React, { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { HMINodeFactory } from "../../components/hmi-node";

import { useEffect } from "react";
import { Save, Add } from "@mui/icons-material";
import { useUpdateElement } from "@hive-command/api";
import { ElementModal } from "../../components/modals/element-pack";
import { useMutation } from "@apollo/client";
import { ElementEditorProvider } from "./context";
import { PreviewView } from "./views/preview";
import { CodeView } from "./views/code";
import { AsyncLoader } from "../../views/Editor/components/async-loader";
import { useRemote } from "../../views/Editor/components/async-loader/loader";

// import { System } from 'systemjs'

// const button = React.lazy(() => import("https://cdn.jsdelivr.net/npm/react-button@1.2.1/lib/index.js"))

export const ElementEditor = (props) => {

    const [ edited, setEdited ] = useState(false)
    const { id } = useParams()

    const anchorEl = useRef<any>();

    const uploadRef = useRef<any>();

    const [ menuOpen, openMenu ] = useState(false);
    
    const [ modalOpen, openModal ] = useState(false);

    const [ selected, setSelected ] = useState<any>();

    const [ view, setView ] = useState('preview');
        
    const { data } = useQuery(gql`
        query Elements($id: ID) {
            commandInterfaceDevicePacks(id: $id) {
                id
                name
                elements {
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
        }
    `, {
        variables: {
            id: id
        }
    })

    const url = "https://raw.githubusercontent.com/TheTechCompany/hive-command-elements/master/dist/";

    const { Component, componentList } = useRemote(url, `index.js`)

    const client = useApolloClient()

    const refetch = () => {
        client.refetchQueries({include: ['Elements']})
    }
    const updateElement = useUpdateElement();

    console.log({data})
    const element = data?.commandInterfaceDevicePacks?.[0]; //find((a) => a.id == id);

    
    // const editDevice = selected;

    const [ editDevice, setEditDevice ] = useState<{
        width?: number,
        height?: number,
        scaleX?: number,
        scaleY?: number,
        name?: string,
        rotation?: number,
        Component?: any,
        ports?: {key: string, x: number, y: number, rotation: number}[] 
    }>({})

    useEffect(() => {
        setEditDevice({
            // selected,
            width: 50,
            height: 50,
            name: "Test",
            Component: Component[selected]
        })
    }, [selected])

    const [ createInterfaceDevice ] = useMutation(gql`
        mutation CreateDevice ($id: ID, $input: CommandHMIDeviceInput) {
            createCommandInterfaceDevice(pack: $id, input: $input){
                id
                name
            }
        }
    `)
    
    return (
        <ElementEditorProvider value={{
            editDevice: editDevice
        }}>
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
            <ElementModal
                open={modalOpen}
                onClose={() => {
                    openModal(false);

                }}
                onSubmit={(element) => {
                    createInterfaceDevice({
                        variables: {
                            id: id,
                            input: {
                                name: element.name
                            }
                        }
                    }).then(() => {
                        refetch()
                        openModal(false)
                    })
                }}
                />
            <Box sx={{flex: 1, display: 'flex'}}>
                <Box sx={{minWidth: '150px'}}>
                    <Box sx={{display: 'flex', padding: '3px', bgcolor: 'secondary.light', alignItems: 'center', justifyContent: 'space-between', color: 'white'}}>
                        <Typography>Elements</Typography>
                        <IconButton
                            onClick={() => {
                                openModal(true)
                            }}
                            size="small" sx={{color: 'white'}}>
                            <Add fontSize="small" />
                        </IconButton>
                    </Box>
                    <List>

                        {/* {data?.commandInterfaceDevicePacks?.[0]?.elements?.map((element) => ( */}
                        {data?.commandInterfaceDevicePacks?.[0]?.elements?.map((element) => (
                            <ListItem 
                                // selected={selected?.id == element.id}
                                onClick={() => {
                                    setSelected(element)
                                }}
                                button>{element.name}</ListItem>
                        ))}
                    </List>
                </Box>

                <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                    <Box sx={{display: 'flex', color: 'white', bgcolor: 'secondary.main', justifyContent: 'space-between'}}>
                        <Button
                            onClick={() => openMenu(true)}
                            ref={anchorEl}
                            sx={{
                                color: 'white'
                            }}>
                            File
                        </Button>
                        <input
                                    onChange={(e) => {

                                        console.log("FILES", {files: e.target.files})

                                        let fileReader = new FileReader();
                                        fileReader.addEventListener('loadend', () => {
                                            let data = fileReader.result;

                                            console.log("READ", {data});

                                            setEditDevice({
                                                ...editDevice,
                                                // code: data.toString()
                                            })
                                        })

                                        fileReader.readAsText(e.target.files?.[0])
                                    }} 
                                    ref={uploadRef} 
                                    accept="image/svg+xml" 
                                    type="file" 
                                    style={{display: 'none'}} />
                        <Menu 
                            anchorEl={anchorEl.current}
                            open={menuOpen}
                            onClose={() => openMenu(false)}>
                            <MenuItem onClick={() => {
                                uploadRef?.current?.click();
                                openMenu(false)
                            }}  dense>
                               
                                Upload
                            </MenuItem>
                        </Menu>
                        <div>
                            <Button
                                sx={{color: 'white', bgcolor: view == 'preview' ? 'secondary.light' : undefined}}
                                onClick={() => setView('preview')}
                                >Preview</Button>
                            <Button
                                sx={{color: 'white', bgcolor: view == 'code' ? 'secondary.light' : undefined}}
                                onClick={() => setView('code')}
                                >Code</Button>
                        </div>
                    </Box>
                    {/* Views here */}
                    {view == 'preview' ? (
                        <PreviewView />
                    ) : (
                        <CodeView />
                    )}
                </Box>
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
        </ElementEditorProvider>
    )
}