import React from 'react';
import { Box } from '@mui/material'
import { Editor } from '../../../../../components/script-editor/editor';
import { useCommandEditor } from '../../../context';
import { toJSType } from '@hive-command/scripting';



export const CodeEditor = (props: any) => {

    const { program : {types, tags} } = useCommandEditor();

    const typeDefs = types.map((x) => {
        return `
        declare interface ${x.name} {
            __tagName?: string;
            ${x.fields.map((field) => `${field.name}: ${toJSType(field.type)}`).join('\n')}
        }`
    })

    const typeNames = types.map((x) => x.name)

    const matchTypes = props.conditions.map((x) => {
        if(x.type == "Type"){
            return types.find((a) => a.id == x.active).name
        }else{
            let type = types.find((a) => a.name == tags.find((a) => a.id == x.active).type);
            return type ? type.name : toJSType(tags.find((a) => a.id == x.active).type)
        }
    }).join(', ')

    return (
        <Box sx={{flex: 1, display: 'flex'}}>
            <Editor
                extraLib={`
                declare enum ALARM_LEVEL {
                    CRITICAL,
                    FAULT,
                    WARNING
                }

                declare async function raiseAlarm(level: ALARM_LEVEL, message: string)

                declare interface Condition {
                    type: "Tag" | "Type";
                    active: string;
                    field: string;
                    comparator: string;
                    value: any
                }
                ${typeDefs.join('\n')}
`}
                value={`export const handler = async (conditions: Condition[], matches: [${matchTypes}]) => {

}`}
                defaultValue={`
                export const handler = () => {

                }
                `}
                />
        </Box>
    )
}