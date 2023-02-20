import { Autocomplete, Box, Divider, TextField, Typography } from '@mui/material';
import { TemplateInput } from '../../../../components/template-input';
import React, { useMemo, useState } from 'react';
import { useCommandEditor } from '../../context';
import { Editor } from '../../../../components/script-editor/editor';
import { DataTypes, formatInterface, lookupType, toJSType } from '@hive-command/scripting';

export const AlarmEditor = () => {

    const { program: {tags, types} } = useCommandEditor()
    const [ conditions, setConditions ] = useState<any[]>([{}]);
    const [ actions, setActions ] = useState<any[]>([{}]);

    const tagInputs = useMemo(() => {

        return tags.map((tag) => {
            let fields = types.find((a) => a.name === tag.type)?.fields || [];

            return [{label: `${tag.name}`, type: 'keyword'}, ...fields.map((field) => ({label: `${tag.name}.${field.name}`, type: 'keyword'}))]
        }).reduce((prev, curr) => prev.concat(curr), []);

    }, [tags, types])

    const typeSchema = useMemo(() => {
        let typeSchema = types?.map((type) => {
            return formatInterface(type.name, type.fields?.reduce((prev, curr) => ({
                ...prev,
                [curr.name]: curr.type ? lookupType(curr.type as keyof typeof DataTypes) : "unknown"
            }), {}))   
        }).join('\n')

        return typeSchema
    }, [types])

    let scalarTypes = Object.keys(DataTypes).concat(Object.keys(DataTypes).map((x) => `${x}[]`))

    const tagSchema = useMemo(() => {

        let tagSchema = tags?.reduce((prev, curr) => {

            return {
                ...prev,
                [curr.name]: scalarTypes.indexOf(curr.type) > -1 ? 
                    ( curr.type?.indexOf('[]') > -1 ? [lookupType(curr.type?.replace('[]', '') as any)] : lookupType(curr.type as any) )
                    : curr.type
            }

        }, {});

        return tagSchema

    }, [tags, types])

    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <Box sx={{flex: 1}}>
                <Box sx={{padding: '6px'}}>
                    Conditions

                    {conditions.map((condition) => (
                        <Box sx={{display: 'flex'}}>
                            <TemplateInput
                                options={tagInputs}
                                value={condition.input}
                                />
                        </Box>
                    ))}
                    
                </Box>
            </Box>
            <Box sx={{display: 'flex', position: 'relative', justifyContent: 'center'}}>
                <Typography sx={{ backgroundColor: "#dfdfdf", paddingLeft: '6px', paddingRight: '6px', borderRadius: '12px', zIndex: 2 }}>Then</Typography>
                <Divider sx={{position: 'absolute', left: 0, top: '50%', right: 0, bottom: '50%'}} />
            </Box>
            <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                <Box sx={{padding: '6px', flex: 1, display: 'flex', flexDirection: 'column'}}>
                   
                    <Box sx={{flex: 1, display: 'flex'}}>

                        <Editor 
                            value={`export const handler = (state: TagState) => {
    
}`}
                            extraLib={`
                                declare function raiseAlarm(message: string)
                                declare function sendSMS(number: string, message: string)
                                declare function sendEmail(email: string[], subject: string, message: string)
                               
                                ${typeSchema}

                                ${formatInterface('TagState', tagSchema)}
                            `}/>
                    </Box>
                    
                </Box>
            </Box>
        </Box>
    )
}