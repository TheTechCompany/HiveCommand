import { CloudUpload, Remove } from '@mui/icons-material';
import { Button, DialogTitle, Typography } from '@mui/material'
import { TextField } from '@mui/material'
import { Box } from '@mui/material';
import { DialogActions } from '@mui/material';
import { IconButton } from '@mui/material';
import { DialogContent } from '@mui/material'
import { Dialog } from '@mui/material'

import { open } from '@tauri-apps/api/dialog';
import { readTextFile } from '@tauri-apps/api/fs';

import React, { useEffect, useState } from 'react'

export interface CRUDHMIModalProps {
    open: boolean;
    onClose?: () => void;
    onSubmit?: (args: {name: string, file: string}) => void;
}

export const CRUDHMIModal = (props: any) => {

    const [ hmiBlob, setHMIBlob ] = useState<any>({});

    // const [ name, setName ] = useState('');

    // const [ selectedFile, setSelectedFile ] = useState<any>(null);


    useEffect(() => {
        if(!props.open){
            setHMIBlob({

            })
        }
    }, [props.open]);

    useEffect(() => {
        setHMIBlob({
            ...props.selected
        })
    }, [props.selected])

    const onSubmit = () => {
        props.onSubmit?.({
            ...hmiBlob
        });
    }

    const onClose = () => {
        props.onClose?.();
    }

    return (
        <Dialog
            fullWidth
            onClose={onClose}
            open={props.open}>
            <DialogTitle>Create HMI</DialogTitle>
            <DialogContent>
                <Box sx={{padding: '6px'}}>
                    <TextField 
                        fullWidth
                        value={hmiBlob.name}
                        onChange={(e) => setHMIBlob({...hmiBlob, name: e.target.value}) }
                        size="small" 
                        label="Name" />
                    <Box 
                        onClick={async () => {
                            if(!hmiBlob.file){
                                const selected = await open({
                                    filters: [
                                        {
                                            name: 'json',
                                            extensions: ['json']
                                        }
                                    ]
                                });

                                if(selected && !(selected instanceof Array)){
                                    const result = await readTextFile(selected)
                                    setHMIBlob({...hmiBlob, file: selected});

                                    console.log({result})
                                }
                            }
                        }}
                        sx={{display: 'flex', marginTop: '12px', alignItems: 'center', justifyContent: 'space-between'}}>
                        {hmiBlob.file ? (
                            <TextField label="HMI File" size="small" fullWidth value={hmiBlob.file} onChange={(e) => setHMIBlob({...hmiBlob, file: e.target.value}) } />
                        ) : (
                            <Box sx={{ flex: 1, padding: '6px'}}>  
                                <Typography sx={{marginLeft: '6px'}}>Select HMI file...</Typography>
                            </Box>
                        )}
                        <IconButton 
                        color={hmiBlob.file ? 'error' : undefined}    
                        onClick={() => {
                            if(hmiBlob.file){
                                setHMIBlob({...hmiBlob, file: null});
                            }
                        }}>
                            {hmiBlob.file ? <Remove /> : <CloudUpload />}
                        </IconButton>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={onSubmit} variant="contained" color="primary">
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    )
}