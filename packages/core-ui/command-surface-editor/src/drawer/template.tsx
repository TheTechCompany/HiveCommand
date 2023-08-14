import React, { useMemo, useEffect, useState, useContext } from 'react';
import { Autocomplete, Box, Card, Divider, FormGroup, IconButton, Select, TextField, Typography } from '@mui/material'
import { HMIContext } from '../context';
import { Close, Delete, Javascript } from '@mui/icons-material'
import { useMutation, gql } from '@apollo/client';
import { TemplateInput } from '../components/template-input';
import { ScriptEditorModal } from '../components/script-editor';
import { DataTypes, formatInterface, fromOPCType, lookupType, toJSType } from '@hive-command/scripting';

export type ConfigInputType = 'Function' | 'Tag' | 'String' | '[String]' | 'Number' | 'Boolean'

export const TemplateMenu = () => {

    const {  templates, selected, programId, tags, types, nodes, onNodesChanged } = useContext(HMIContext);
// 
    // const item = nodes?.find((a) => a.id == selected.id);


    const selected_nodes = selected?.nodes || [];
    const selected_edges = selected?.edges || [];

    const item = selected_nodes?.[0] || selected_edges?.[0] //nodes?.find((a) => a.id == selected.id);


    const options = item?.data?.iconOptions || {};

    const templateOptions = item?.data?.templateOptions || [];

    const [ templateState, setTemplateState ] = useState<any>([])

    // const [ state, setState ] = useState<any>([])

    let scalarTypes = Object.keys(DataTypes).concat(Object.keys(DataTypes).map((x) => `${x}[]`))

    const [ functionArgs, setFunctionArgs ] = useState<{extraLib?: string, defaultValue?: string} | null>(null);
    const [ functionOpt, setFunctionOpt ] = useState<any>()


    const [ws, setWs] = useState<any>({});

    // const updateHMINode = useUpdateHMINode(programId)

    const [ assignNodeTemplate ] = useMutation(gql`
        mutation AssignNode ($nodeId: ID, $input: ComandProgramInterfaceNodeInput!){
            updateCommandProgramInterfaceNode(id: $nodeId, input: $input){
                id
            }
        }
    `)

    const [ updateNodeTemplateConfig ] = useMutation(gql`
        mutation UpdateNodeTemplateConfig ($nodeId: ID, $fieldId: ID, $value: String){
            updateCommandProgramInterfaceNodeTemplateConfiguration(node: $nodeId, field: $fieldId, value: $value)
        }
    `)

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

        let tagSchema = tags?.reduce((prev, curr) => {
            // console.log({inScalar: curr.type in scalarTypes, index: curr.type.indexOf('[]') > -1, replace: curr.type.replace(/[]/, '')})
            return {
                ...prev,
                [curr.name]: scalarTypes.indexOf(curr.type) > -1 ? 
                    ( curr.type.indexOf('[]') > -1 ? `${lookupType(curr.type?.replace('[]', '') as keyof typeof DataTypes)}[]` : lookupType(curr.type as keyof typeof DataTypes) )
                    : curr.type
            }

        }, {});

        return tagSchema

    }, [tags, types])

    const tagInputs = useMemo(() => {

        return tags?.map((tag) => {
            let fields = types?.find((a) => a.name === tag.type)?.fields || [];

            return [{label: `${tag.name}`, type: 'keyword'}, ...fields.map((field) => ({label: `${tag.name}.${field.name}`, type: 'keyword'}))]
        }).reduce((prev, curr) => prev.concat(curr), []);

    }, [tags, types])
    // useEffect(() => {
    //     let  newState = Object.keys(options).map((optionKey) => ({key: optionKey, value: item?.data?.options?.[optionKey]}));

    //     setState(newState)

    // }, [selected, options])

    // useEffect(() => {
    //     if(templateOptions){
    //         setTemplateState(templateOptions);
    //     }
    // }, [templateOptions])



    const [ updateBouncer, setUpdateBouncer ] = useState<any>(null);

    const nodeMap = (node: any) => ({
        id: node.id,
                
        type: node.data.type,

        options: node.data.options,

        x: node.position.x,
        y: node.position.y,
        width: node.data.width,
        height: node.data.height,
    })


    const _updateState = (key: string, value: any) => {
        console.log(key, value);

        let n = (nodes || []).slice();
        let ix = n.findIndex((a: any) => a.id == item.id);
        console.log(n, ix, nodes);

        if(ix > -1){
            
            n[ix].data = {
                ...n[ix].data,
                options: {
                    ...n[ix].data?.options || {},
                    [key]: value
                }
            }

            onNodesChanged?.(n.map(nodeMap));
        }


        // setState((state: any) => {
        //     console.log(state)
        //     let ix = state.map((x: any) => x.key).indexOf(key)
        //     state[ix].value = value;
        //     return state;
        // })

        if(updateBouncer){
            clearTimeout(updateBouncer)
            setUpdateBouncer(null)
        }
        setUpdateBouncer(
            setTimeout(() => {
                // updateHMINode(item.id, {options: state.reduce((prev, curr) => ({...prev, [curr.key]: curr.value}), {})}).then((r) => {
                //     refetch?.()
                // })
            }, 500)
        )

    }

    
    const renderConfigInput = ({type, value, label, id}: {type: ConfigInputType, value: any, label: string, id?: string}, updateState: ((key: string, value: any) => void) = _updateState) => {

        // label = id || label;

        if(typeof(value) === 'string' && value?.indexOf('script://') > -1 && type !== "Function"){
            return  (<Box sx={{display: 'flex', flexDirection: 'column'}}>
                <Typography fontSize="small">{label}</Typography>
                <Typography color="gray" fontSize={"small"}>Provided by script</Typography>
                
            </Box>)
        }

        const type_parts = type.split(':');
        if(type_parts.length > 1){
            type = type_parts[0] as ConfigInputType;
        }

        switch(type){
            case 'Tag':

                let options = tags?.slice()?.sort((a, b) => `${a.name}`.localeCompare(`${b.name}`));

                if(type_parts[1]){
                    options = options?.filter((a) => a?.type == types?.find((a) => a.id === type_parts[1])?.name );
                }


                return (
                // <Box>

                    <Autocomplete 
                        disablePortal
                        options={options || []}
                        value={options?.find((a) => a.id == value) || null}
                        
                        onChange={(event, newValue) => {
                            if(typeof(newValue) === 'string') return console.error("Tag input with string value")
                            updateState(id || label, newValue?.id)
                            // if(!newValue){
                            //     updateState(label, null)
                            // }else{
                            //     setFunctionArgs(newValue);
                            //     setFunctionOpt(label)
                            // }
                        }}
                        getOptionLabel={(option) => typeof(option) == "string" ? option : `${option.name}`}
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
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
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
                   <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <Typography sx={{flex: 1}} fontSize={'small'}>{label}</Typography>
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

                                ${formatInterface('Tags', tagSchema || {})}
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
                            <Box sx={{display: 'flex', position: 'relative', alignItems: 'center', '& .MuiIconButton-root': {opacity: 0}, '&:hover .MuiIconButton-root': {opacity: 1} }}>
                                <li style={{flex: 1}} {...props as any}>
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
                            if(e.key === "Enter"){
                                updateState(id || label, [ ...new Set((value || []).concat(ws?.[label])) ])
                                setWs((ws: any) => { ws[label] = ''; return ws })
                            }
                        }}
                        renderInput={(params) => <TextField {...params} onChange={(e) => setWs((ws: any) => {ws[label] = e.target.value; return ws} )} label={label} />}
                        freeSolo
                        />)
                })();
                    
            case 'String':
                //[{label: 'AV101', type: "keyword"}, {label: 'AV101.open', type: 'keyword'}, {label: 'AV201.open', type: 'keyword'}]

                return (
                    <TemplateInput
                        label={label}
                        value={value || ''}
                        options={tagInputs /* assignableDevices.map((device) => {

                            return [{label: device.tag, type: 'keyword'}].concat(device.type?.state?.map((stateItem) => ({label: `${device.tag}.${stateItem.key}`, type: 'keyword' })))
                        }).reduce((prev, curr) => prev.concat(curr), []) */}
                        onChange={(e) => {
                            updateState(id || label, e)
                        }}
                        />

                    // <TextField 
                    //     value={value || ''}
                    //     onChange={(e) => {
                    //         updateState(id || label, e.target.value)
                    //     }}
                    //     size="small" 
                    //     label={label} />
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

    const activeTemplate = useMemo(() => templates?.find((a) => a.id === item?.data?.template), [item?.data?.template]);

    const templateInputs = useMemo(() => {
        

        return  activeTemplate ? (
            <Card elevation={5} sx={{padding: '6px'}}>
                <Typography sx={{marginBottom: '6px'}} fontSize={'small'}>Template Options</Typography>
                {activeTemplate?.inputs?.map((input) => (
                    <Box sx={{marginBottom: '6px'}}>
                        {renderConfigInput(
                            { id: input.id, type: input.type, value: templateState?.find((a: any) => input.id === a.field?.id)?.value || null, label: input.name },
                            (key, value) => {
                                updateNodeTemplateConfig({
                                    variables: {
                                        nodeId: item?.id,
                                        fieldId: key,
                                        value
                                    }
                                }).then(() => {
                                    // refetch();
                                })
                            }
                        )}
                    </Box>
                ))}
            </Card>
        ) : null
    }, [activeTemplate, templateState])


    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', paddingLeft: '6px', paddingTop: '6px', paddingRight: '6px'}}>
           
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

           <Box sx={{marginBottom: '6px'}}>
                <Autocomplete
                    fullWidth
                    options={templates || []}
                    value={templates?.find((a) => a.id === item?.data?.template) || null}
                    disablePortal
                    onChange={(e, newVal) => {
                        if(typeof(newVal) === 'string') return;
                        if(!item?.id) return
                        assignNodeTemplate({
                            variables: {
                                nodeId: item?.id,
                                input: {
                                    template: newVal?.id || null
                                }
                            }
                        })
                        //.then(() => refetch?.());
                    }}
                    getOptionLabel={(option) => typeof(option) === 'string' ? option : option?.name}
                    renderInput={(params) => <TextField  {...params} size="small" label="Template" />}
                    />

            </Box>
            {templateInputs}

            <Divider sx={{marginTop: '12px', marginBottom: '12px'}} />
            <Typography fontSize="small">Node Options</Typography>
            <FormGroup>
                    {Object.keys(options).map((optionKey) => {
                        const type = options[optionKey];
                        const value = item?.data?.options?.[optionKey] //state?.find((a: any) => a.key == optionKey)?.value;
                        const label = optionKey

                        const templateOutput = activeTemplate?.outputs?.find((a) => a.name === label && a.type === type)

                        return (<Box sx={{marginTop: '6px', alignItems: 'center', display: 'flex'}}>
                            {templateOutput ? (
                                <>
                                    <Typography color={'gray'} fontSize={'small'}>{label} - provided by template</Typography>
                                </>
                            ) : (
                                <>
                                 <Box sx={{flex: 1, opacity: templateOutput ? 0.1 : 1}}>
                                    {renderConfigInput({type, value, label})}
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
                                            ${formatInterface('Tags', tagSchema || {})}
                                        `
                                        });
                                    }}
                                    size="small">
                                    <Javascript fontSize="inherit" />
                                </IconButton>}
                                </>
                            )}
                           
                        </Box>)

                    })}
                </FormGroup>
        </Box>
    )
}