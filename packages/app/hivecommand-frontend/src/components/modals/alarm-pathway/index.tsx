import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import React, { useState } from "react";


export const AlarmPathwayModal : React.FC<{
    open: boolean;
    onClose?: () => void;
    onSubmit?: (pathway: any) => void;
}> = (props) => {

    const [ pathway, setPathway ] = useState<{
        name?: string;
        scope?: string;
    }>({});

    const submit = () => {
        props.onSubmit?.(pathway)
        setPathway({})
    }

    return (
        <Dialog 
            fullWidth
            open={props.open} 
            onClose={props.onClose}>
            <DialogTitle>
                Create Alarm Pathway
            </DialogTitle>
            <DialogContent sx={{display: 'flex'}}>
                <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '12px'}}>
                    <TextField  
                        value={pathway.name || null}
                        onChange={(e) => setPathway({...pathway, name: e.target.value})}
                        fullWidth 
                        size="small" 
                        label="Name" />


                    <Autocomplete 
                        sx={{marginTop: '6px'}}
                        options={["Local", "Scope"]}
                        value={pathway.scope || null}
                        onChange={(e, value) => {
                            setPathway({...pathway, scope: value || undefined})
                        }}
                        renderInput={(params) => <TextField {...params} size="small" label="Scope" />} />

                </Box>

            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Cancel</Button>
                <Button onClick={submit} color="primary" variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    )
}