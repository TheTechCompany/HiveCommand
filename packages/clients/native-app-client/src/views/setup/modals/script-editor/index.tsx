import { Button, Dialog, DialogActions, TextareaAutosize, DialogContent, DialogTitle, TextField, Box } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import Editor from "@monaco-editor/react";
import { formatInterface, fromOPCType, lookupType, toJSType } from '@hive-command/scripting'

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


export const hasOPCChildren = (elem: {type?: string, children?: any[]}) => {
    return !elem.type && elem.children && elem.children.length > 0
}

export const ScriptEditorModal : React.FC<ScriptEditorProps> = (props) => {

    const isDatatypeArray = (props.dataType || '').indexOf('[]') > -1;

    console.log("Script editor datatype", {dataType: props.dataType})
    const defaultValue = `//Transform data before returning to getter
export const getter = (tags: ValueStore) : ${toJSType(props.dataType?.replace('[]', '') as any || 'String')}${isDatatypeArray ? '[]' : ''} => {

}

//Transform data before sending to OPC-UA
export const setter = (data: ${toJSType(props.dataType?.replace('[]', '') as any || 'String')}${isDatatypeArray ? '[]' : ''}, tags: ValueStore, setTags: SetTags) => {

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

            console.log(elem.name)

            // if(elem.name.match('[-=.\/:]') != null) return {key: undefined, value: undefined};

            let formattedName = elem.name.replace(/[ -]/g, '_');
            
            // if(elem.type) console.log(elem.type, fromOPCType(elem.type))
            

            return hasOPCChildren(elem) ? 
                 { key: formattedName, value: elem.children.map(printJson).reduce((prev: any, curr: any) => ({...prev, [curr.key] : curr.value}), {}) } : 
                { key: formattedName, value: elem.isArray ? [lookupType(elem.type)] : lookupType(elem.type) } //`${elem.name}: ${fromOPCType(elem.type)}${elem.isArray ? '[]' : ''};`
        }

        // console.log(props.deviceValues.map(printJson) )

        const deviceValues = (props.deviceValues || []).map(printJson).reduce((prev, curr) => ({...prev, [curr.key]: curr.value}), {})
        
        console.log({deviceValues: props.deviceValues, dv: deviceValues})
        
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
                    beforeMount={(monaco) => {
                        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                            // noSemanticValidation: true,
                            noSyntaxValidation: false
                            
                          });
                        
                          // compiler options
                          monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                            target: monaco.languages.typescript.ScriptTarget.ES5,
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