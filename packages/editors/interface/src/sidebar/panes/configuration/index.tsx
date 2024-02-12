import React, { useMemo, useEffect, useState, useContext } from 'react';
import { Autocomplete, Box, Card, Divider, FormGroup, IconButton, Select, TextField, Typography } from '@mui/material'
import { Close, Delete, Javascript } from '@mui/icons-material'
import { useMutation, gql } from '@apollo/client';
import { TemplateInput, ScriptEditorModal } from '@hive-command/ui';
import { DataTypes, formatInterface, fromOPCType, lookupType, toJSType } from '@hive-command/scripting';
import { Node } from 'reactflow';
import { HMITag, HMITemplate, HMIType } from '@hive-command/interface-types'
import { useInterfaceEditor } from '../../../context';
import { ConfigInput } from './render';
import { TemplateConfiguration } from './templates';



export interface ConfigurationPaneProps {

    onNodeUpdate?: (update: any) => void;

    // assignNode
}

export const ConfigurationPane: React.FC<ConfigurationPaneProps> = (props) => {

    const { selected, nodes, tags = [], templates = [], types = [] } = useInterfaceEditor()

    const selectedNode = nodes?.find((a) => a.id == selected?.nodes?.[0]?.id);


    const configuredOptions = selectedNode?.data?.configuredOptions || {};


    const options = selectedNode?.data?.options || {};

    const [state, setState] = useState<{ key: string, value: any }[]>([])

    let scalarTypes = Object.keys(DataTypes).concat(Object.keys(DataTypes).map((x) => `${x}[]`))

    const [functionArgs, setFunctionArgs] = useState<{ extraLib?: string, defaultValue?: string } | null>(null);
    const [functionOpt, setFunctionOpt] = useState<any>()



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
        if (options) {
            let newState = Object.keys(options).map((optionKey) => ({ key: optionKey, value: configuredOptions?.[optionKey] }));

            setState(newState)
        }
    }, [ JSON.stringify(options), JSON.stringify(configuredOptions) ])


    const [updateBouncer, setUpdateBouncer] = useState<any>(null);

    const _updateState = (key: string, value: any) => {

        let _state = state.slice();

        let ix = _state.map((x) => x.key).indexOf(key)
        _state[ix].value = value;

        setState(_state);

        props.onNodeUpdate?.({
            data: {
                configuredOptions: _state.reduce((prev, curr) => ({ ...prev, [curr.key]: curr.value }), {})
            }
        })


    }

    const activeTemplate = useMemo(() => templates?.find((a) => a.id === selectedNode?.data?.template), [selectedNode?.data?.template]);


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

         
            <TemplateConfiguration onNodeUpdate={props.onNodeUpdate} />

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
                                    <ConfigInput
                                        type={ type }
                                        value={value}
                                        label={label}
                                        onUpdateState={_updateState}
                                        onUpdateStateJs={(key, args) => {
                                            setFunctionArgs(args || null);
                                            setFunctionOpt(key)
                                        }} />
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