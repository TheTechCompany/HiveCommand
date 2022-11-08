import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import React, { useEffect, useState } from "react";
import { EditorMenuProvider } from "./context";
import { DeviceView, HMIView, ProgramView } from "./views";

export interface EditorMenuDialogProps {
    open: boolean;
    type: string;
    selected?: any;
    onDelete?: () => void;
    onClose?: () => void;
    onSubmit?: (item: any) => void;
}

export const EditorMenuDialog : React.FC<EditorMenuDialogProps> = (props) => {

    const { selected, type } = props;

    const [ item, setItem ] = useState<any>({});

    useEffect(() => {
        setItem({
            ...selected
        })
    }, [selected, type])

    const getTitle = () => {
        switch(type){
            case 'program':
                return `${selected ? 'Edit' : 'Create'} Program`
            case 'hmi':
                return `${selected ? 'Edit' : 'Create'} HMI`
            case 'devices':
                return `${selected ? 'Edit' : 'Create'} Device`
            case 'variable':
                return `${selected ? 'Edit' : 'Create'} Variable`
            case 'alarm':
                return `${selected ? 'Edit' : 'Create'} Alarm`
        }
    }

    const getContent = () => {
        switch(type){
            case 'program':
                return <ProgramView />
            case 'hmi':
                return <HMIView />
            case 'devices':
                return <DeviceView />
        }
    }

    console.log({props})
    const getActions = () => {
        switch(type){
            case 'program':
            case 'hmi':
            case 'devices':
                return <Box sx={{display: 'flex', flex: 1, alignItems: 'center', justifyContent: ( Boolean(props.selected?.id) ? 'space-between' : 'flex-end') }}>
                    {props.selected?.id ? (
                        <Button variant="contained" color="error" onClick={props.onDelete}>
                            Delete
                        </Button>
                    ) : null}
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <Button onClick={props.onClose}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={onSubmit}>
                        Save
                    </Button>
                    </Box>
                </Box>
        }
    }

    const onSubmit = () => {
        props.onSubmit?.(item)
    }

    return (
        <Dialog 
            // maxWidth="sm"
            fullWidth
            open={props.open} 
            onClose={props.onClose}>
            <EditorMenuProvider value={{item, setItem}}>
                <DialogTitle>{getTitle()}</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column'}}>
                    <Box sx={{flex: 1, margin: '6px', display: 'flex'}}>
                        {getContent()}
                    </Box>
                </DialogContent>
                <DialogActions sx={{display: 'flex', flex: 1, justifyContent: 'unset'}}>
                    {getActions()}
                </DialogActions>
            </EditorMenuProvider>
        </Dialog>
    )
}