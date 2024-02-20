import React, { useCallback, useMemo } from 'react';
import { Box } from '@mui/material'
import { Editor } from '../../../../components/script-editor/editor';
import { useCommandEditor } from '../../context';
import { DataTypes, formatInterface, lookupType, toJSType } from '@hive-command/scripting';
import { gql, useMutation } from '@apollo/client';

import  {debounce } from 'lodash'
import { useParams } from 'react-router-dom';

export const CodeEditor = (props: any) => {

    const { activeId } = useParams();

    const { program, setProgram  } = useCommandEditor();
    const {id: program_id, types, tags, alarmPathways} = program || {};

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

    const typeNames = types?.map((x) => x.name)


    const currentPathway = alarmPathways?.find((a) => a.id == activeId);

    const [_updateAlarm] = useMutation(gql`
        mutation UpdateAlarmPathway ($program: ID, $id: ID!, $input: CommandProgramAlarmPathwayInput){
            updateCommandProgramAlarmPathway(program: $program, id: $id, input: $input){
                id
            }
        }
    `)



    const updateAlarm = useCallback((id: string, script: string) => {
        let prg = {
            ...program
        }

        let alarms = (prg.alarmPathways || [])?.slice();
        let ix = alarms?.findIndex((a) => a.id == id);
        
        alarms[ix] = {
            ...alarms[ix],
            script,
        }
        prg.alarmPathways = alarms;
        setProgram(prg);

        return _updateAlarm({variables: {
            program: program_id,
            id: activeId,
            input: {
                script,
            }
        }})
    }, [JSON.stringify(program), program_id, activeId ])
    
    const _debounceUpdate = useMemo(() => debounce(updateAlarm, 200), [JSON.stringify(program), program_id, activeId ])

    return (
        <Box sx={{flex: 1, display: 'flex'}}>
            <Editor
                onChange={(value) => {
                    if(activeId) _debounceUpdate(activeId, value)
                    
                }}
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
                value={currentPathway?.script}
                defaultValue={`export const sendNotification = async (message: string) => {

}`}
                />
        </Box>
    )
}