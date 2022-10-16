import { ChevronRight, ExpandMore } from '@mui/icons-material';
import { TreeItem, TreeView } from '@mui/lab';
import { Typography } from '@mui/material';
import { Box } from '@mui/material';
import { Button } from '@mui/material';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import React, { useEffect, useState } from 'react';

export interface DeviceMappingModalProps {
    open: boolean;
    selected?: any;
    dataLayout?: {id: string, path: string, label: string, type?: string, children?: {id: string, path: string, label: string, type?: string}[]}[]
    onSubmit?: (mapping: any) => void;
    onClose?: () => void;
}

export const DeviceMappingModal : React.FC<DeviceMappingModalProps> = (props) => {

    const [ selectedItem, setSelectedItem ] = useState<any>(null);

    const [ mapping, setMapping ] = useState<any>({});

    useEffect(() => {
        setMapping({
            ...props.selected
        })
    }, [props.selected])

    const opcuaTree = [
        {
            id: 'objects',
            label: 'Objects',
            children: [
                {
                    id: '101',
                    label: 'Object 1',
                    children: [
                        {
                            id: '102',
                            label: 'Object 1 - State'
                        }
                    ]
                }
            ]
        },
        {
            id: 'server',
            label: 'Server'
        }
    ]

    const onSubmit = () => {
        props.onSubmit?.(selectedItem)
        setSelectedItem(null)
    }

    const renderItems = (tree: any[]) => {
        return (tree || []).map((treeItem) => (
            <TreeItem nodeId={treeItem.path} label={`${treeItem.label}${treeItem.type ? ` - ${treeItem.type}`: ''}`}>
                {renderItems(treeItem.children || [])}
            </TreeItem>
        ))
    }
    return (
        <Dialog 
            fullWidth
            onClose={props.onClose}
            open={props.open}>
            <DialogTitle>Map Element</DialogTitle>
            <DialogContent>
                <Typography>Selected element : {mapping?.parent?.label} - {mapping?.label}</Typography>
                <Box sx={{padding: '6px', minHeight: '20vh'}}>
                    <TreeView
                        onNodeSelect={(evt, nodeIds) => {
                            // console.log({nodeIds})
                            setSelectedItem(nodeIds)
                        }}
                        defaultCollapseIcon={<ExpandMore />}
                        defaultExpandIcon={<ChevronRight />}>

                        {renderItems(props.dataLayout)}
                    </TreeView>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>
                    Cancel
                </Button>
                <Button onClick={onSubmit} variant="contained">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    )
}