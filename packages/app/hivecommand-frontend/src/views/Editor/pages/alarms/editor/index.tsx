import { Autocomplete, Box, Divider, Paper, Tab, Tabs, TextField, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useCommandEditor } from '../../../context';
import { Add } from '@mui/icons-material'
import { DataTypes, formatInterface, lookupType, toJSType } from '@hive-command/scripting';
import { nanoid } from 'nanoid';
import 'reactflow/dist/style.css';
import { PipelineEditor } from './pipeline';
import { CodeEditor } from './code';
import { AlarmConditions } from './condition';


export const AlarmEditor = (props: any) => {


    const [ view, setView ] = useState<'conditions' | 'pipeline' | 'code'>('conditions')
    const { program: { tags, types, alarms } } = useCommandEditor()


    const alarm = useMemo(() => {
        return alarms.find((a) => a.id == props.active);
    }, [alarms, props.active])

    const ALARM_NODES = useMemo(() => {
        return (alarm.nodes || []).map((node) => {
            return {
                id: node.id,
                label: node?.type?.name,
                parent: node?.targetedBy?.[0]?.source?.id || 'trigger'
            }
        }).concat([{id: 'trigger', label: "Trigger"}])
    }, [alarm])


    const [conditions, setConditions] = useState<{
        type?: "Tag" | "Type", 
        active?: string, 
        field?: string,

        comparator?: string,
        value?: any
    }[]>([]);

    // const [ ALARM_NODES, setAlarmNodes ] = useState([
    //         {
    //             id: '1',
    //             label: "Start",
                
    //         },
    //         {
    //             id: '2',
    //             label: "NExt",
    //             parent: '1'
    //         },
    //         {
    //             id: '3',
    //             label: "PRev",
    //             parent: '1'
    //         },
    //         {
    //             id: '4',
    //             label: "NEXTER",
    //             parent: '2',
    //         },
    //         {
    //             id: '5',
    //             label: "NEXXX",
    //             parent: '2',
    //         },
    //         // {
    //         //     id: '6',
    //         //     label: 'NNN',
    //         //     parent: '3'
    //         // }
    //     ])


    const tagInputs = useMemo(() => {

        return tags.map((tag) => {
            let fields = types.find((a) => a.name === tag.type)?.fields || [];

            return [{ label: `${tag.name}`, type: 'keyword' }, ...fields.map((field) => ({ label: `${tag.name}.${field.name}`, type: 'keyword' }))]
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
                    (curr.type?.indexOf('[]') > -1 ? [lookupType(curr.type?.replace('[]', '') as any)] : lookupType(curr.type as any))
                    : curr.type
            }

        }, {});

        return tagSchema

    }, [tags, types])


    const renderView = () => {
        switch(view){
            case 'conditions':
                return <AlarmConditions active={props.active} />
            case 'pipeline':
                return <PipelineEditor active={props.active} />
            case 'code':
                return <CodeEditor conditions={conditions} />
        }
    }

    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <Paper sx={{bgcolor: 'secondary.main', color: 'white'}}>
                <Typography sx={{padding: '6px'}}>{alarms?.find((a) => a.id == props.active)?.name}</Typography>
                <Tabs value={view} onChange={(e, newValue) => setView(newValue)}>
                    <Tab value="conditions" label="Conditions"/>   
                    <Tab value="pipeline" label="Pipeline" />
                    <Tab value="code" label="Code" />
                </Tabs>
            </Paper>
            {renderView()}
        </Box>
    )
}