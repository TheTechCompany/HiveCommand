import { gql, useMutation } from '@apollo/client';
import { Box, Button, IconButton, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import { DragIndicator, Delete } from '@mui/icons-material'
import { DragOverlay, DndContext, useSensors, useSensor, KeyboardSensor, PointerSensor, closestCenter } from '@dnd-kit/core';
import { SortableContext,verticalListSortingStrategy, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import { MoreVert } from '@mui/icons-material'

export const Severity = (props: any) => {

    const [ activeId, setActiveId ] = useState<any>(null);

    const { severities } = props;

    const [localSeverities, setLocalSeverities] = useState<any[]>([]);


    useEffect(() => {
        setLocalSeverities(severities)
    }, [severities])

    const [createSeverity] = useMutation(gql`
        mutation CreateAlarmSeverity ($program: ID, $input: CommandProgramAlarmSeverityInput){
            createCommandProgramAlarmSeverity(program: $program, input: $input){
                id
            }
        }
    `, {
        refetchQueries: ['EditorCommandProgram']
    })

    const [updateSeverity] = useMutation(gql`
        mutation UpdateAlarmSeverity ($program: ID, $id: ID!, $input: CommandProgramAlarmSeverityInput){
            updateCommandProgramAlarmSeverity(program: $program, id: $id, input: $input){
                id
            }
        }
    `, {
        refetchQueries: ['EditorCommandProgram']
    })

    const _debounceUpdate = useMemo(() => debounce(updateSeverity, 200), [])

    const debounceUpdate = (update: { variables: { program: string, id: string, input: any } }) => {
        let _alarms = localSeverities.slice();

        let ix = _alarms?.findIndex((a) => a.id == update.variables.id);

        if (ix > -1) {
            _alarms[ix] = {
                ..._alarms[ix],
                ...update.variables.input
            }
        }

        setLocalSeverities(_alarms)

        _debounceUpdate({
            variables: {
                program: update.variables.program,
                id: update.variables.id,
                input: {
                    title: _alarms[ix].title,
                    // message: _alarms[ix].message
                }
            }
        })
    }
    const [deleteSeverity] = useMutation(gql`
        mutation DeleteAlarmSeverity ($program: ID, $id: ID!) {
            deleteCommandProgramAlarmSeverity(program: $program, id: $id){
                id
            }
        }
    `, {
        refetchQueries: ['EditorCommandProgram']
    })

    const sortedSeverities = localSeverities?.slice()?.sort((a, b) => a.rank?.localeCompare(b.rank))

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: any) => {
        const { active, over } = event;

        setActiveId(active);
    }


    return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', padding: '6px' }}>
                <TextField fullWidth size="small" label="Search" />
            </Box>
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={() => setActiveId(null)}
              collisionDetection={closestCenter}>
                <SortableContext
                    strategy={verticalListSortingStrategy}
                    items={sortedSeverities}>
                    <Table size='small'>
                        <TableHead>
                            <TableCell></TableCell>
                            <TableCell sx={{ color: 'white' }}>Title</TableCell>
                            <TableCell sx={{ color: 'white' }}>Colour</TableCell>
                            <TableCell></TableCell>
                        </TableHead>
                        <TableBody>

                            {sortedSeverities?.map((severity) => (
                                <SeverityItem {...severity} />
                            ))}
                        </TableBody>
                    </Table>
                    <DragOverlay>
                        {activeId && <BaseSeverityItem />}
                    </DragOverlay>
                </SortableContext>
            </DndContext>
            <Button onClick={() => {
                createSeverity({
                    variables: {
                        program: props.program,
                        input: { title: '' }
                    }
                })
            }}>Add</Button>
        </Box>
    )
}

export const SeverityItem = (props: any) => {
    const { transform, transition, setNodeRef, listeners, attributes } = useSortable({id: props.id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    }

    return (
        <TableRow ref={setNodeRef} key={props.id} style={style} {...attributes}>
            <TableCell sx={{ padding: 0 }}>
                <IconButton  {...listeners}  size="small">
                    <DragIndicator fontSize='inherit' />
                </IconButton>
            </TableCell>
            <TableCell sx={{ padding: 0 }}>
                <TextField variant="standard" size="small" fullWidth value={props.title} />
            </TableCell>
            <TableCell sx={{ padding: 0 }}>
                <input type="color" style={{ border: 'none', outline: 'none', background: 'transparent' }} />
            </TableCell>
            <TableCell>
                <IconButton size='small'>
                    <MoreVert fontSize='inherit' />
                </IconButton>
                <IconButton size="small">
                    <Delete fontSize='inherit'/>
                </IconButton>
            </TableCell>
        </TableRow>
    )
}

export const BaseSeverityItem = (props: any) => {
    return (
        <div>
        <div >
            <DragIndicator fontSize='small' />
        </div>
        <div >
            <TextField variant="standard" size="small" fullWidth value={props.title} />
        </div>
        <div >
            <input type="color" style={{ border: 'none', outline: 'none', background: 'transparent' }} />
        </div>
    </div>
    )
}  