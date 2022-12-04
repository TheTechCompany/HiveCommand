import { TreeItem, TreeView } from '@mui/lab';
import { Box, Button, Divider, InputAdornment, TextField } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import { SetupContext } from '../context';
import { ChevronRight, ExpandMore } from '@mui/icons-material';
import axios from 'axios';

export interface OPCUAServerItem {
    id: string;
    name: string;
    children: OPCUAServerItem[]
}
export const OPCUAServerStage = () => {

    const { state, setState, globalState } = useContext(SetupContext);

    const controlLayout = globalState.controlLayout;

    const [ opcua, setOPCUA ] = useState<OPCUAServerItem[]>([]);

    const scanOPCUA = () => {
        return axios.get(`http://localhost:${8484}/${state.opcuaServer}/tree`).then((r) => r.data)
    }

    useEffect(() => {
        scanOPCUA().then((data) => {
            if(data.results){
                setOPCUA(data.results || [])
            }else{
                console.log({data})
            }
        })
    }, [])

    const renderTree = (items: OPCUAServerItem[]) => {
        return items.map((item) => (
            <TreeItem nodeId={item.id} label={item.name}>
                {item.children ? renderTree(item.children) : undefined}
            </TreeItem>
        ))
    }


    const devices = (controlLayout.devices || []).map((x: any) => ({
        id: x.id,
        name: x.tag,
        children: (x.state || []).map((y: any) => ({
            id: `${x.id}.${y.key}`,
            name: y.key
        }))
    }))

    return (
        <Box sx={{flex: 1, marginTop: '24px', display: 'flex', flexDirection: 'column',  paddingLeft: '6px', paddingRight: '6px'}}>
            <Box sx={{display: 'flex',marginBottom: '6px', alignItems: 'center'}}>
                <Box sx={{display: 'flex', marginRight: '6px', flex: 1}}>
                <TextField 
                    value={state.opcuaServer || ''}
                    onChange={(e) => setState('opcuaServer', e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start">opc.tcp://</InputAdornment>
                    }}
                    label="OPCUA Server Endpoint"  
                    fullWidth 
                    size="small"/>
                </Box>
                <Button variant='contained'>Scan Server</Button>
            </Box>
            
            <Divider />
            <Box sx={{flex: 1, display: 'flex'}}>
                <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                    <TreeView
                        sx={{flex: 1, '.MuiTreeItem-content': {padding: 0}}}
                        defaultCollapseIcon={<ExpandMore />}
                        defaultExpandIcon={<ChevronRight />}>
                        
                        {renderTree(opcua)}

                    </TreeView>
                </Box>
                <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                    <TreeView
                        sx={{flex: 1, '.MuiTreeItem-content': {padding: 0}}}
                        defaultCollapseIcon={<ExpandMore />}
                        defaultExpandIcon={<ChevronRight />}
                        >
                        {renderTree(devices)}
                    </TreeView>
                </Box>
            </Box>

        </Box>
    )
}