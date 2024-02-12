import React, { useMemo } from 'react';
import { Box } from '@mui/material'
import { Editor } from '../../../../../components/script-editor/editor';
import { useCommandEditor } from '../../../context';
import { DataTypes, formatInterface, lookupType, toJSType } from '@hive-command/scripting';



export const CodeEditor = (props: any) => {

    const { program : {types, tags} = {} } = useCommandEditor();

    const typeDefs = types?.map((x) => {
        return `
        declare interface ${x.name} {
            __tagName?: string;
            ${x.fields.map((field) => `${field.name}: ${toJSType(field.type)}`).join('\n')}
        }`
    })


    let scalarTypes = Object.keys(DataTypes).concat(Object.keys(DataTypes).map((x) => `${x}[]`))



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
                    (curr.type.indexOf('[]') > -1 ? `${lookupType(curr.type?.replace('[]', '') as keyof typeof DataTypes)}[]` : lookupType(curr.type as keyof typeof DataTypes))
                    : curr.type
            }

        }, {});

        return tagSchema

    }, [tags, types])

    const inverseTagSchema = useMemo(() => {
        
        let inverse = tags?.reduce((prev, curr) => {
            // console.log({inScalar: curr.type in scalarTypes, index: curr.type.indexOf('[]') > -1, replace: curr.type.replace(/[]/, '')})
            
            const type = scalarTypes.indexOf(curr.type) > -1 ?
                    (curr.type.indexOf('[]') > -1 ? `${lookupType(curr.type?.replace('[]', '') as keyof typeof DataTypes)}[]` : lookupType(curr.type as keyof typeof DataTypes))
                    : curr.type

            return {
                ...prev,
                [type]: [
                    ...(prev[type] || []),
                    tagSchema?.[curr.name]
                ]
            }

        }, {});

        return inverse

    }, [tagSchema, tags, types])

    console.log({inverseTagSchema})
    const typeNames = types?.map((x) => x.name)


    return (
        <Box sx={{flex: 1, display: 'flex'}}>
            <Editor
                extraLib={`

                ${typeSchema}
                ${formatInterface("Tags", tagSchema || {})}
                ${formatInterface("Types", inverseTagSchema || {})}

                declare enum ALARM_LEVEL {
                    CRITICAL,
                    FAULT,
                    WARNING
                }

                /*
                    Raise an alarm
                    @param message - Alarm message
                    @param level - Alarm level for sorting
                    @param sticky - false = raise new alarm each time, true = raise alarm again only after acknowledgement
                */
                declare async function raiseAlarm(message: string, level?: ALARM_LEVEL, sticky?: boolean): Promise<boolean>

                declare async function sendNotification(message: string, pathway?: string)

                ${typeDefs?.join('\n')}
`}
                value={`export const handler = async (tags: Tags, types: Types) => {

}`}
                defaultValue={`
                export const handler = () => {

                }
                `}
                />
        </Box>
    )
}