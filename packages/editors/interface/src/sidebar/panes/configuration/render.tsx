import React, {useMemo, useState, useEffect } from 'react';
import { Typography, Box, IconButton, TextField, Button, Autocomplete } from '@mui/material'
import { TemplateInput } from '@hive-command/ui';
import { Delete, Javascript } from '@mui/icons-material'
import { useInterfaceEditor } from '../../../context';

import { DataTypes, formatInterface, fromOPCType, lookupType, toJSType } from '@hive-command/scripting';


export type ConfigInputType = 'Function' | 'Tag' | 'String' | '[String]' | 'Number' | 'Boolean'

let scalarTypes = Object.keys(DataTypes).concat(Object.keys(DataTypes).map((x) => `${x}[]`))

export interface ConfigInputProps {
    type: ConfigInputType;
    value: any;
    label: string;
    id?: string;

    onUpdateState?: (key: string, value: any) => void;

    onUpdateStateJs?: (key: string, args?: {defaultValue?: string, extraLib?: string}) => void;
}

export const ConfigInput : React.FC<ConfigInputProps> = (props) => {

    const { type, value, label, id, onUpdateState, onUpdateStateJs } = props;

    let realType = type;

    const { tags = [], types = [] } = useInterfaceEditor();

    const typeSchema = useMemo(() => {
        let typeSchema = types?.map((type) => {
            return formatInterface(type.name, type.fields?.reduce((prev, curr) => ({
                ...prev,
                [curr.name]: curr.type ? lookupType(curr.type as keyof typeof DataTypes) : "unknown"
            }), {}))
        }).join('\n')

        return typeSchema
    }, [types])

    const tagSchema = useMemo(() => {

        let tagSchema = tags.reduce((prev, curr) => {
            // console.log({inScalar: curr.type in scalarTypes, index: curr.type.indexOf('[]') > -1, replace: curr.type.replace(/[]/, '')})
            if(curr.type)
            return {
                ...prev,
                [curr.name]: scalarTypes.indexOf(curr.type) > -1 ?
                    (curr.type.indexOf('[]') > -1 ? `${lookupType(curr.type?.replace('[]', '') as keyof typeof DataTypes)}[]` : lookupType(curr.type as keyof typeof DataTypes))
                    : curr.type
            }
            else return prev;

        }, {});

        return tagSchema

    }, [tags, types])

    const tagInputs = useMemo(() => {

        return tags?.map((tag) => {
            let fields = types?.find((a) => a.name === tag.type)?.fields || [];

            return [{ label: `${tag.name}`, type: 'keyword' }, ...fields.map((field) => ({ label: `${tag.name}.${field.name}`, type: 'keyword' }))]
        }).reduce((prev, curr) => prev.concat(curr), []);

    }, [tags, types])
    
    const [ws, setWs] = useState<{ [key: string]: any }>({});

    // label = id || label;

    if (typeof (value) === 'string' && value?.indexOf('script://') > -1 && type !== "Function") {
        return (<Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography fontSize="small">{label}</Typography>
            <Typography color="gray" fontSize={"small"}>Provided by script</Typography>

        </Box>)
    }

    const type_parts = type.split(':');
    if (type_parts.length > 1) {
        realType = type_parts[0] as ConfigInputType;
    }

    switch (realType) {
        case 'Tag':

            let options = tags?.slice()?.sort((a, b) => `${a.name}`.localeCompare(`${b.name}`));

            if (type_parts[1]) {
                options = options?.filter((a) => a?.type == types.find((a) => a.id === type_parts[1])?.name);
            }


            return (
                // <Box>

                <Autocomplete
                    disablePortal
                    options={options}
                    value={options?.find((a) => a.id == value) || null}

                    onChange={(event, newValue) => {
                        if (typeof (newValue) === 'string') return console.error("Tag input with string value")
                        onUpdateState?.(id || label, newValue?.id)
                        // if(!newValue){
                        //     updateState(label, null)
                        // }else{
                        //     setFunctionArgs(newValue);
                        //     setFunctionOpt(label)
                        // }
                    }}
                    getOptionLabel={(option) => typeof (option) == "string" ? option : `${option.name}`}
                    // isOptionEqualToValue={(option, value) => option.id == value.id}
                    renderInput={(params) =>
                        <TextField
                            {...params}
                            label={label}
                        />
                    }
                    // value={value || ''}
                    // onChange={(e) => {
                    //     updateState(label, e.target.value)
                    // }}
                    size="small"
                // label={label} />
                />

                // </Box>
            )
        case 'Boolean':
            return (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <input
                        checked={Boolean(value)}
                        type="checkbox"
                        onChange={(evt) => {
                            onUpdateState?.(id || label, evt.target.checked)
                        }} />

                    <Typography>{label}</Typography>
                </Box>
            )
        case 'Function':
            return (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ flex: 1 }} fontSize={'small'}>{label}</Typography>
                    <IconButton
                        size="small"
                        onClick={() => {

                            onUpdateStateJs?.(label, {
                                defaultValue: value ? value?.match(/script:\/\/(.*)/s)?.[1] : `export const handler = (elem: {x: number, y: number, width: number, height: number}, state: Tags, setState: (values: DeepPartial<Tags>) => void, args: any[], transformer: (state: any) => any) => {


}`,
                                extraLib: `
                            declare function showWindow(
                                position: {x: number, y: number, width: number, height: number, anchor?: string},
                                data: (state: any) => any,
                                transformer?: (state: any) => any
                            ){

                            }

                            declare function showTagWindow(
                                position: {x: number, y: number, width: number, height: number, anchor?: string},
                                deviceTag: string,
                                state: string[],
                                actions?: { label: string, func: string }[],
                                setpoints?: (state: any) => ({ label: string, getter: () => any, setter?: (value: any) => void }[]),
                                manual?: (state: any) => ({getter: () => boolean, setter: (value: boolean) => void}),
                                transformer?: (state: any) => any
                            ){
                                
                            }

                            declare function changeView(view: string){

                            }

                            ${typeSchema}

                            ${formatInterface('Tags', tagSchema)}
                        `
                            })


                            // const valueState = assignableDevices?.map((dev) => {
                            //     let state = dev.type.state.map((stateItem) => { 
                            //         return {key: stateItem.key, value: fromOPCType(stateItem.type)}
                            //      }).reduce((prev, curr) => ({
                            //         ...prev,
                            //         [curr.key]: curr.value
                            //      }), {})

                            //      return {key: dev.tag, value: state}
                            // // `${dev.tag}: { ${dev.type?.state?.map((stateItem) => `${stateItem.key}: ${ getOPCType(stateItem.type) }`).join('\n')} }`).join(';\n')
                            // }).reduce((prev, curr) => ({
                            //     ...prev,
                            //     [curr.key]: curr.value
                            // }), {});

                            console.log("SCRIPT", value);

                        }}>
                        <Javascript fontSize='inherit' />
                    </IconButton>
                </Box>
            );
        case '[String]':
            return (() => {


                return (<Autocomplete
                    options={value || []}
                    size="small"
                    value={ws?.[label] || ''}

                    renderOption={(props, option) => (
                        <Box sx={{ display: 'flex', position: 'relative', alignItems: 'center', '& .MuiIconButton-root': { opacity: 0 }, '&:hover .MuiIconButton-root': { opacity: 1 } }}>
                            <li style={{ flex: 1 }} {...props as any}>
                                <Typography>{option}</Typography>
                            </li>
                            <Box sx={{
                                position: 'absolute',
                                right: '6px',
                                top: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <IconButton size="small"><Delete color='error' fontSize='inherit' /></IconButton>
                            </Box>
                        </Box>)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onUpdateState?.(id || label, [...new Set((value || []).concat(ws?.[label]))])
                            setWs((ws) => { ws[label] = ''; return ws })
                        }
                    }}
                    renderInput={(params) => <TextField {...params} onChange={(e) => {
                        setWs((ws) => { ws[label] = e.target.value; return ws })
                    }} label={label} />}
                    freeSolo
                />)
            })();

        case 'String':

            return (
                <TemplateInput
                    label={label}
                    value={value || ''}
                    options={tagInputs}
                    onChange={(e) => {
                        onUpdateState?.(id || label, e)
                    }}
                />
            );
        case 'Number':
            return (
                <TextField
                    value={value || ''}
                    type="number"
                    onChange={(e) => {
                        onUpdateState?.(id || label, e.target.value)
                    }}
                    size="small"
                    label={label} />
            );

        default:
            return (<span>{realType} not found in renderConfigInput</span>)
    }
}

