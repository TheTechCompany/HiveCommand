import React, { useMemo, useEffect, useState, useContext } from 'react';
import { Autocomplete, Box, Card, Divider, FormGroup, IconButton, Select, TextField, Typography } from '@mui/material'
import { Close, Delete, Javascript } from '@mui/icons-material'
import { useMutation, gql } from '@apollo/client';
import { TemplateInput, ScriptEditorModal } from '@hive-command/ui';
import { DataTypes, formatInterface, fromOPCType, lookupType, toJSType } from '@hive-command/scripting';
import { Node } from 'reactflow';
import { HMITag, HMITemplate, HMIType } from '@hive-command/interface-types'
import { useInterfaceEditor } from '../../../context';

export type ConfigInputType = 'Function' | 'Tag' | 'String' | '[String]' | 'Number' | 'Boolean'


export interface ConfigurationPaneProps {

    onNodeUpdate?: (update: any) => void;

    // assignNode
}

export const ConfigurationPane: React.FC<ConfigurationPaneProps> = (props) => {

    const { selected, nodes, tags = [], templates = [], types = [] } = useInterfaceEditor()

    const selectedNode = nodes?.find((a) => a.id == selected?.nodes?.[0]?.id);


    const configuredOptions = selectedNode?.data?.configuredOptions || {};

    const templateOptions = selectedNode?.data?.templateOptions || [];

    const options = selectedNode?.data?.options || {};

    const [templateState, setTemplateState] = useState<{ field: { id: string }, value: any }[]>([])

    const [state, setState] = useState<{ key: string, value: any }[]>([])

    let scalarTypes = Object.keys(DataTypes).concat(Object.keys(DataTypes).map((x) => `${x}[]`))

    const [functionArgs, setFunctionArgs] = useState<{ extraLib?: string, defaultValue?: string } | null>(null);
    const [functionOpt, setFunctionOpt] = useState<any>()


    const [ws, setWs] = useState<{ [key: string]: any }>({});

    const updateHMINode = () => {

    }


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
            return {
                ...prev,
                [curr.name]: scalarTypes.indexOf(curr.type) > -1 ?
                    (curr.type.indexOf('[]') > -1 ? `${lookupType(curr.type?.replace('[]', '') as keyof typeof DataTypes)}[]` : lookupType(curr.type as keyof typeof DataTypes))
                    : curr.type
            }

        }, {});

        return tagSchema

    }, [tags, types])

    const tagInputs = useMemo(() => {

        return tags?.map((tag) => {
            let fields = types?.find((a) => a.name === tag.type)?.fields || [];

            return [{ label: `${tag.name}`, type: 'keyword' }, ...fields.map((field) => ({ label: `${tag.name}.${field.name}`, type: 'keyword' }))]
        }).reduce((prev, curr) => prev.concat(curr), []);

    }, [tags, types])

    useEffect(() => {
        console.log("Running newState effect")
        if (options) {
            let newState = Object.keys(options).map((optionKey) => ({ key: optionKey, value: configuredOptions?.[optionKey] }));

            setState(newState)
        }
    }, [ JSON.stringify(options), JSON.stringify(configuredOptions) ])

    console.log({
        state,
        configuredOptions,
        options,
        templateOptions
    })

    useEffect(() => {
        if (templateOptions) {
            setTemplateState(templateOptions);
        }
    }, [templateOptions])



    const [updateBouncer, setUpdateBouncer] = useState<any>(null);

    const _updateState = (key: string, value: any) => {

        
        let _state = state.slice();

        let ix = _state.map((x) => x.key).indexOf(key)
        _state[ix].value = value;

        setState(_state);

        console.log(_state, key, value)

        props.onNodeUpdate?.({
            data: {
                configuredOptions: _state.reduce((prev, curr) => ({ ...prev, [curr.key]: curr.value }), {})
            }
        })


    }


    const renderConfigInput = ({ type, value, label, id }: { type: ConfigInputType, value: any, label: string, id?: string }, updateState: ((key: string, value: any) => void) = _updateState) => {

        // label = id || label;

        if (typeof (value) === 'string' && value?.indexOf('script://') > -1 && type !== "Function") {
            return (<Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography fontSize="small">{label}</Typography>
                <Typography color="gray" fontSize={"small"}>Provided by script</Typography>

            </Box>)
        }

        const type_parts = type.split(':');
        if (type_parts.length > 1) {
            type = type_parts[0] as ConfigInputType;
        }

        switch (type) {
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
                            updateState(id || label, newValue?.id)
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
                                updateState(id || label, evt.target.checked)
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
                                setFunctionOpt(label);


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

                                setFunctionArgs({
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
                                });
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
                                updateState(id || label, [...new Set((value || []).concat(ws?.[label]))])
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
                            updateState(id || label, e)
                        }}
                    />
                );
            case 'Number':
                return (
                    <TextField
                        value={value || ''}
                        type="number"
                        onChange={(e) => {
                            updateState(id || label, e.target.value)
                        }}
                        size="small"
                        label={label} />
                );

            default:
                return (<span>{type} not found in renderConfigInput</span>)
        }
    }

    const activeTemplate = useMemo(() => templates?.find((a) => a.id === selectedNode?.data?.template), [selectedNode?.data?.template]);

    const templateInputs = useMemo(() => {
        return activeTemplate ? (
            <Card elevation={5} sx={{ padding: '6px' }}>
                <Typography sx={{ marginBottom: '6px' }} fontSize={'small'}>Template Options</Typography>
                {activeTemplate?.inputs?.map((input) => (
                    <Box sx={{ marginBottom: '6px' }}>
                        {renderConfigInput(
                            { id: input.id, type: input.type, value: templateState?.find((a) => input.id === a.field?.id)?.value || null, label: input.name },
                            (key, value) => {
                                props.onNodeUpdate?.({
                                    data: {
                                        templateOptions: { [key]: value }
                                    }
                                });

                                // props.onNodeTemplateUpdate?.({[key]:  value})

                                // updateNodeTemplateConfig({
                                //     variables: {
                                //         nodeId: selected?.id,
                                //         fieldId: key,
                                //         value
                                //     }
                                // }).then(() => {
                                //     refetch();
                                // })
                            }
                        )}
                    </Box>
                ))}
            </Card>
        ) : null
    }, [activeTemplate, templateState])


    return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <ScriptEditorModal
                open={Boolean(functionOpt)}
                onClose={() => {
                    setFunctionOpt(null);
                }}

                onSubmit={(code) => {
                    _updateState(functionOpt, `script://${code}`)
                    // updateNodeTemplateConfig({
                    //     variables: {
                    //         nodeId: selected?.id,
                    //         fieldId: functionOpt,
                    //         value: `script://${code}`
                    //     }
                    // }).then(() => {
                    setFunctionOpt(null);
                    // })

                    // updateState(functionOpt, `script://${code}`)
                }}
                defaultValue={functionArgs?.defaultValue}
                extraLib={functionArgs?.extraLib}

            // variables={variables}
            // deviceValues={[{name: 'PMP101', children: [{name: 'on', type: 'BooleanT'}]}]}
            // actions={[
            //     {
            //         name: 'setView',
            //         type: 'void',
            //         args: [{name: 'view', type: 'string'}]
            //     }
            // ]}
            />

            <Box sx={{ marginBottom: '6px' }}>
                <Autocomplete
                    fullWidth
                    options={templates || []}
                    value={templates?.find((a) => a.id === selectedNode?.data?.template) || null}
                    disablePortal
                    onChange={(e, newVal) => {
                        if (typeof (newVal) === 'string') return;
                        // if(!selected?.id) return

                        props.onNodeUpdate?.({ data: { template: newVal?.id || null } });

                        // assignNodeTemplate({
                        //     variables: {
                        //         nodeId: selected?.id,
                        //         input: {
                        //             template: newVal?.id || null
                        //         }
                        //     }
                        // }).then(() => refetch?.());
                    }}
                    getOptionLabel={(option) => typeof (option) === 'string' ? option : option?.name}
                    renderInput={(params) => <TextField  {...params} size="small" label="Template" />}
                />

            </Box>
            {templateInputs}


            <Divider sx={{ marginTop: '12px', marginBottom: '12px' }} />
            <Typography fontSize="small">Node Options</Typography>
            <FormGroup>
                {Object.keys(options).map((optionKey) => {
                    const type = options[optionKey];
                    const value = state?.find((a) => a.key == optionKey)?.value;
                    const label = optionKey

                    const templateOutput = activeTemplate?.outputs?.find((a) => a.name === label && a.type === type)

                    return (<Box sx={{ marginTop: '6px', alignItems: 'center', display: 'flex' }}>
                        {templateOutput ? (
                            <>

                                <Typography color={'gray'} fontSize={'small'}>{label} - provided by template</Typography>
                            </>
                        ) : (
                            <>
                                <Box sx={{ flex: 1, opacity: templateOutput ? 0.1 : 1 }}>
                                    {renderConfigInput({ type, value, label })}
                                </Box>
                                {type !== "Function" && <IconButton
                                    onClick={() => {
                                        setFunctionOpt(label);


                                        // const valueState = assignableDevices?.map((dev) => {
                                        //     let state = dev.type.state.map((stateItem) => { 
                                        //         return {key: stateItem.key, value: fromOPCType(stateItem.type)}
                                        //     }).reduce((prev, curr) => ({
                                        //         ...prev,
                                        //         [curr.key]: curr.value
                                        //     }), {})

                                        //     return {key: dev.tag, value: state}
                                        // // `${dev.tag}: { ${dev.type?.state?.map((stateItem) => `${stateItem.key}: ${ getOPCType(stateItem.type) }`).join('\n')} }`).join(';\n')
                                        // }).reduce((prev, curr) => ({
                                        //     ...prev,
                                        //     [curr.key]: curr.value
                                        // }), {});

                                        setFunctionArgs({
                                            defaultValue: value ? value.replace('script://', '') : `export const getter = (values: Tags) : ${toJSType(lookupType(type))} => {

}

export const setter = (value: ${toJSType(lookupType(type))}, setValues: (values: DeepPartial<Tags>) => void) => {

}
`,
                                            extraLib: `
                                            ${typeSchema}
                                            ${formatInterface('Tags', tagSchema)}
                                        `
                                        });
                                    }}
                                    size="small">
                                    <Javascript fontSize="inherit" />
                                </IconButton>}
                            </>
                        )
                        }

                    </Box>)

                })}
            </FormGroup>
        </Box>
    )
}