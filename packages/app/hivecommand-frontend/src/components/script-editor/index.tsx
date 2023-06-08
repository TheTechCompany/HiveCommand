import { Button, Dialog, DialogActions, TextareaAutosize, DialogContent, DialogTitle, TextField, Box } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import {Editor} from "./editor";

const systemJsDefine = window.define;


export interface DeviceValue {
    // id: string,
    name: string,
    type?: string,
    children?: DeviceValue[]
}

export interface ScriptEditorProps {
    open: boolean,
    
    selected?: string,

    dataType?: string,
    // variables?: HMIVariable[],
    // deviceValues?: DeviceValue[],

    // actions?: {name: string, type: string, args: {name: string, type: string}[]}[]

    onClose?: () => void

    onSubmit?: (code: string) => void;

    defaultValue?: string;
    extraLib?: string | {path: string, content: string}[];

}


// export const getOPCType = (type: string) => {
//     switch(type){
//         case 'NodeId':
//         case 'LocalizedText':
//         case 'QualifiedName':
//         case 'String':
//             return 'string';
//         case 'Boolean':
//         case 'BooleanT':
//             return 'boolean';
//         case 'Byte':
//         case 'Float':
//         case 'Double':
//         case 'UInt16':
//         case 'UInt32':
//         case 'UInt64':
//         case 'UIntegerT':
//         case "IntegerT":
//             return 'number';
//         case 'DateTime':
//             return 'Date'
//         default:
//             return type || 'string';
//     }
// }



export const ScriptEditorModal : React.FC<ScriptEditorProps> = (props) => {

   
    const defaultValue = `//Transform data before returning to getter
export const handler = () => {

}`
    const [ value, setValue ] = useState<string | undefined>(props.defaultValue || defaultValue);


    useEffect(() => {
        setValue(props.defaultValue)
    }, [props.defaultValue])

    
    // useEffect(() => {
    //     setValue(defaultValue)
    // }, [props.dataType])

    // useEffect(() => {
    //     setValue(props.selected)
    // }, [props.selected])



    const onSubmit = () => {
        if(value) props.onSubmit?.(value)
        setValue(props.defaultValue || defaultValue)
    }


    return (
        <Dialog 
            fullWidth
            fullScreen
            open={props.open} 
            onClose={props.onClose}>
            <DialogTitle>Script Editor</DialogTitle>
            <DialogContent sx={{overflow: 'visible', display: 'flex', position: 'relative'}}>
                <Box sx={{flex: 1, zIndex: 99, display: 'flex', overflow: 'visible', position: 'relative', minHeight: '200px', maxHeight: '100%', margin: '6px'}}>
                <Editor 
                    extraLib={props.extraLib}
                    defaultValue={props.defaultValue}
                    value={value}
                    onChange={(editorValue) => {
                        setValue(editorValue)
                    }}
                    />
              
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Cancel</Button>
                <Button onClick={onSubmit} variant="contained" color="primary">Save</Button>
            </DialogActions>
        </Dialog>
    )
}