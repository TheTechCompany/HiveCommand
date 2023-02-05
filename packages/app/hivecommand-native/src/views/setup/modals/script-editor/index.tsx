import { Button, Dialog, DialogActions, TextareaAutosize, DialogContent, DialogTitle, TextField, Box } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import Editor from "@monaco-editor/react";
import { formatInterface, fromOPCType, lookupType } from '@hive-command/scripting'

export interface DeviceValue {
    id: string,
    name: string,
    type?: string,
    children?: DeviceValue[]
}

export interface ScriptEditorProps {
    open: boolean,
    
    selected?: string,

    dataType?: string,
    deviceValues?: DeviceValue[],

    onClose?: () => void

    onSubmit?: (code: string) => void;
}


export const getOPCType = (type: string) => {
    switch(type){
        case 'NodeId':
        case 'LocalizedText':
        case 'QualifiedName':
        case 'String':
            return 'string';
        case 'Boolean':
        case 'BooleanT':
            return 'boolean';
        case 'Byte':
        case 'Float':
        case 'Double':
        case 'UInt16':
        case 'UInt32':
        case 'UInt64':
        case 'UIntegerT':
        case "IntegerT":
            return 'number';
        case 'DateTime':
            return 'Date'
        default:
            return type || 'string';
    }
}



export const hasOPCChildren = (elem: {type?: string, children?: any[]}) => {
    return !elem.type && elem.children && elem.children.length > 0
}

export const ScriptEditorModal : React.FC<ScriptEditorProps> = (props) => {

    const defaultValue = `//Transform data before returning to getter
export const getter = (tags: ValueStore) : ${fromOPCType(props.dataType || 'String')} => {

}

//Transform data before sending to OPC-UA
export const setter = (data: ${fromOPCType(props.dataType || 'String')}, tags: ValueStore, setTags: SetTags) => {

}`
    const [ value, setValue ] = useState<string | undefined>(defaultValue);


    useEffect(() => {
        setValue(defaultValue)
    }, [props.dataType])

    useEffect(() => {
        setValue(props.selected)
    }, [props.selected])

    const deviceValueMap = useMemo(() => {

        const printJson =  (elem: any) => {

            if(elem.name.match('[-=.\/:]') != null || elem.type === undefined) return {key: undefined, value: undefined};
            
            // if(elem.type) console.log(elem.type, fromOPCType(elem.type))
            

            return hasOPCChildren(elem) ? 
                 { key: elem.name, value: elem.children.map(printJson).reduce((prev: any, curr: any) => ({...prev, [curr.key] : curr.value}), {}) } : 
                { key: elem.name, value: elem.isArray ? [fromOPCType(elem.type)] : fromOPCType(elem.type) } //`${elem.name}: ${fromOPCType(elem.type)}${elem.isArray ? '[]' : ''};`
        }

        const deviceValues = (props.deviceValues || []).map(printJson).reduce((prev, curr) => ({...prev, [curr.key]: curr.value}), {})
        
        const valueInterface = formatInterface('ValueStore', deviceValues)

        // console.log({valueInterface, deviceValues, dv: props.deviceValues})
        // //TODO add readonly fields
        // let inf = `interface ValueStore {
        //     ${(props.deviceValues || [])?.map(printJson).join(';\n')}
        // }`
        return valueInterface //formatInterface('ValueStore', deviceValues);

    }, [props.deviceValues])

    const onSubmit = () => {
        if(value) props.onSubmit?.(value)
        setValue(defaultValue)
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
                    // height="100%"
                    beforeMount={(monaco) => {
                        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                            // noSemanticValidation: true,
                            noSyntaxValidation: false
                          });
                        
                          // compiler options
                          monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                            target: monaco.languages.typescript.ScriptTarget.ES6,
                            allowNonTsExtensions: true
                          });


                      
                          var libSource = `
                            declare class Fact {
                                static next():string
                            }
                            interface Action {
                                id: string
                            }

                            type DeepPartial<T> = {
                                [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
                            };

                            ${deviceValueMap}

                            declare type SetTags = (tags: DeepPartial<ValueStore>) => void

                            declare type Direction = "IN" | "OUT"
                          
                          `

                          var libUri = "ts:filename/facts.d.ts";
                          monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri);
                          // When resolving definitions and references, the editor will try to use created models.
                          // Creating a model for the library allows "peek definition/references" commands to work with the library.
                          let model = monaco.editor.getModel(monaco.Uri.parse(libUri));

                          if(model){
                            model.setValue(libSource)
                          }else{
                            monaco.editor.createModel(libSource, "typescript", monaco.Uri.parse(libUri));
                          }
                        //   monaco.editor.getModel()


                    }}
                    defaultLanguage="javascript"
                    value={value}
                    onChange={(value) => {
                        setValue(value)
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