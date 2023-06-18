import React, { useEffect, useMemo, useState } from 'react';
import { ReactFlow, Background, Controls, Handle, Position, applyNodeChanges } from 'reactflow';
import {DndContext} from '@dnd-kit/core';
import {Box, Paper, Typography} from '@mui/material';
import { DropNode, NodeDropzone } from './node';
import { useCommandEditor } from '../../../context';
import * as d3 from 'd3-hierarchy'
import { nanoid } from 'nanoid';
import { ActionModal } from './modals/actions';

export const PipelineEditor = (props: any) => {
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

    
    const [ actionModalOpen, openActionModal ] = useState(false);

    const [ nodes, setNodes ] = useState<any[]>([])

    const nodesObj = useMemo(() => {

        const parentNodes = [...new Set(ALARM_NODES.map((x) => x.id))].filter((a) => a !== undefined)

        console.log({parentNodes, ALARM_NODES})

        const treeMap = d3.stratify<{parent?: string, id: string, type?: string}>()
            .parentId((a) => a.parent)
            .id((a) => a.id)(ALARM_NODES.concat(parentNodes.map((x) => ({id: 'add-' + x, label: "+", width: 50, height: 50, type: 'addNode', parent: x}))))
        
        return d3.tree<{type?: string, parent?: string}>().separation((a) => 2).nodeSize([100, 100])(treeMap) //.nodeSize([100, 100])(treeMap)

    }, [ALARM_NODES])

     useEffect(() => {
        const reduceFn = (prev: any[], arr: any) => {
            if(arr.children){
              return [...prev, arr].concat(arr.children.reduce(reduceFn, []))
            }else{
              return [...prev, arr]
            }
          }
          
        const nodes = [nodesObj].concat(nodesObj.children.reduce(reduceFn, [])).map((x) => ({...x, id: x.id, height: 50, width: 50, type: x.data?.type, position: {x: x.x, y: x.y}}))
        
        setNodes(nodes);

    }, [nodesObj])

    
    console.log({nodes, nodesObj})

    const edges = useMemo(() => {
        const reduceToEdge = (prev: any, arr: any) => {
            if(arr.children){
            return prev.concat( 
                    arr.children.map((x: any) => ({
                        id: nanoid(), 
                        source: arr.id, 
                        target: x.id
                    })).concat(arr.children.reduce(reduceToEdge, [])) 
                )
            }
            return prev;
        }
  
        return [nodesObj].reduce(reduceToEdge, [])
    }, [nodesObj])

    const flowControls = [
        "IF condition",
        "For Loop"
    ]

    const actions = [
        "Email",
        "HTTP Request",
        "SMS",
        "Create Log"
    ]
    
    return (
    <DndContext onDragEnd={({over}) => {
        console.log({over: over.id})
        if(over.id.toString().indexOf('add-') > -1){

            openActionModal(true);

            // setAlarmNodes((nodes) => {
            //     return [...nodes, {id: nanoid(), label: "NEW", parent: over.id.toString().split('-')?.[1]}]
            // })
        }
    }}>
    <Box sx={{ flex: 1, display: 'flex' }}>

        <ActionModal
            open={actionModalOpen}
            onClose={() => openActionModal(false)}
            />
        <ReactFlow
            onNodeClick={(e, node) => {
                if(node.id.indexOf('add-') > -1){
                    
                    openActionModal(true);

                    // setAlarmNodes((nodes) => {
                    //     return [...nodes, {id: nanoid(), label: "NEW", parent: node.id.split('-')?.[1]}]
                    // })
                }
            }}
            nodeTypes={{
                addNode: (params) => <NodeDropzone {...params} />
            
            }}
            onNodesDelete={(deleted) => {
                console.log(deleted)
            }}
            nodes={nodes || []}
            edges={edges || []}
            >
            <Background />
            <Controls />
        </ReactFlow>
        <Paper 
            sx={{minWidth: '200px', padding: '6px', overflow: 'visible', background: '#dfdfdf'}}>
            <Typography>Flow Controls</Typography>
            
            {flowControls.map((control) => (
                <DropNode  style={{marginBottom: '6px'}} id={control}>
                    <Paper sx={{padding: '3px'}}>
                        {control}
                    </Paper>
                </DropNode>
            ))}

            <Typography>Actions</Typography>
            {actions.map((action) => (
                <DropNode style={{marginBottom: '6px'}} id={action}>
                    <Paper sx={{padding: '3px'}}>
                        {action}
                    </Paper>
                </DropNode>
            ))}

        </Paper>

        {/* <Editor
            value={`export const handler = (state: TagState) => {

}`}
            extraLib={`
                            declare function raiseAlarm(message: string)
                            declare function sendSMS(number: string, message: string)
                            declare function sendEmail(email: string[], subject: string, message: string)
                           
                            ${typeSchema}

                            ${formatInterface('TagState', tagSchema)}
                        `} /> */}
    </Box>
    </DndContext>)

}