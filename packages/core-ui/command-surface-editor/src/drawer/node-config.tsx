import { useUpdateHMINode } from '@hive-command/api';
import { Box, TextField } from '@mui/material';
import React from 'react';
import { Node } from 'reactflow';
import { useHMIContext } from '../context';
import { BumpInput } from '@hexhive/ui';
import { RotateLeft, RotateRight } from '@mui/icons-material';

export const NodeConfig = (props: {item: Node}) => {

    const { item } = props;

    const { programId, interfaces, refetch, selected } = useHMIContext();

    const updateHMINode = useUpdateHMINode(programId)


    return (
        <Box sx={{display: 'flex', flexDirection: 'column'}}>
            <TextField
                sx={{marginBottom: '6px', marginTop: '6px'}}
                fullWidth
                size="small"
                label="X"
                value={(item as Node)?.position?.x || null}
                onChange={(e) => {
                    updateHMINode(item.id, { x: parseFloat(e.target.value) }).then(() => {
                        refetch()
                    })
                }}
                type="number" />
            <TextField
                sx={{marginBottom: '6px', marginTop: '6px'}}
                fullWidth
                size="small"
                label="Y"
                value={(item as Node)?.position?.y || null}
                onChange={(e) => {
                    updateHMINode(item.id, { y: parseFloat(e.target.value) }).then(() => {
                        refetch()
                    })
                }}
                type="number" />
            <TextField 
                sx={{marginBottom: '6px', marginTop: '6px'}}
                fullWidth
                size="small"
                label="Width" 
                value={item?.data?.width || ''} 
                onChange={(e) => {
                    updateHMINode(item.id, { width: parseInt(e.target.value) }).then(() => {
                        refetch()
                    })
                }}
                type="number"  />
            <TextField 
                sx={{marginBottom: '6px', marginTop: '6px'}}
                fullWidth
                size="small"
                label="Height" 
                value={item?.data?.height || ''} 
                onChange={(e) => {
                    updateHMINode(item.id, { height: parseInt(e.target.value) }).then(() => {
                        refetch()
                    })
                }}
                type="number" />

            <TextField 
                sx={{marginBottom: '6px', marginTop: '6px'}}
                fullWidth
                size="small"
                label="Scale X" 
                value={item?.data?.scaleX || ''} 
                onChange={(e) => {
                    updateHMINode(item.id, { scaleX: parseFloat(e.target.value) }).then(() => {
                        refetch()
                    })
                }}
                type="number" />

            <TextField 
                sx={{marginBottom: '6px', marginTop: '6px'}}
                fullWidth
                size="small"
                label="Scale Y" 
                value={item?.data?.scaleY || ''} 
                onChange={(e) => {
                    updateHMINode(item.id, { scaleY: parseFloat(e.target.value) }).then(() => {
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
                value={item?.data?.zIndex || ''}
                onChange={(e) => {
                    updateHMINode(item.id, { zIndex: parseFloat(e.target.value)}).then(() => {
                        refetch()
                    })
                }} />
            <BumpInput
                placeholder="Rotation"
                type="number"
                leftIcon={<RotateLeft  fontSize="small"  />}
                rightIcon={<RotateRight  fontSize="small" />}
                value={item?.data?.rotation}
                onLeftClick={() => {
                    updateHMINode(item.id, { rotation: (item?.data?.rotation || 0) - 90 }).then(() => {
                        refetch()
                    })
                }}
                onRightClick={() => {
                    updateHMINode(
                        item.id,
                        { rotation: (item?.data?.rotation || 0) + 90 }
                    ).then(() => {
                        refetch()
                    })
                }}
                onChange={(e) => {
                    updateHMINode(
                        item.id,
                        { rotation: parseFloat(e) }
                    ).then(() => {
                        refetch()
                    })

                }}
            />
        </Box>
    )
}