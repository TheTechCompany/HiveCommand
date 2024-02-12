import React, { useEffect, useMemo, useState } from 'react';
import { Box, Table, TableHead, TableCell, TableBody, TableRow, Button, TextField, TableContainer, Select, IconButton, MenuItem } from '@mui/material';
import { MoreVert, DragIndicator, Delete } from '@mui/icons-material'
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';

export interface AlarmListProps {
    program: string;
    alarms?: any[];
    severities?: any[];
}

export const AlarmList : React.FC<AlarmListProps> = (props) => {

    const navigate = useNavigate();

    const { alarms, severities } = props;

    const [ localAlarms, setLocalAlarms ] = useState<any[]>([]);

    useEffect(() => {
        setLocalAlarms(alarms || []);
    }, [alarms])

    const [ createAlarm ] = useMutation(gql`
        mutation CreateAlarm ($program: ID, $input: CommandProgramAlarmInput){
            createCommandProgramAlarm(program: $program, input: $input){
                id
            }
        }
    `, {
        refetchQueries: ['EditorCommandProgram']
    })

    const [ updateAlarm ] = useMutation(gql`
        mutation UpdateAlarm ($program: ID, $id: ID!, $input: CommandProgramAlarmInput){
            updateCommandProgramAlarm(program: $program, id: $id, input: $input){
                id
            }
        }
    `, {
        refetchQueries: ['EditorCommandProgram']
    })

    const _debounceUpdate = useMemo(() => debounce(updateAlarm, 200), [])

    const debounceUpdate = (update: {variables: {program: string, id: string, input: any}}) => {
        let _alarms = localAlarms.slice();

        let ix = _alarms?.findIndex((a) => a.id == update.variables.id);

        if(ix > -1){
            _alarms[ix] = {
                ..._alarms[ix],
                ...update.variables.input
            }
        }

        setLocalAlarms(_alarms)

        _debounceUpdate({
            variables: {
                program: update.variables.program,
                id: update.variables.id,
                input: {
                    title: _alarms[ix].title,
                    script: _alarms[ix].script
                }
            }
        })
    }
    const [ deleteAlarm ] = useMutation(gql`
        mutation DeleteAlarm ($program: ID, $id: ID!) {
            deleteCommandProgramAlarm(program: $program, id: $id){
                id
            }
        }
    `, {
        refetchQueries: ['EditorCommandProgram']
    })


    const sortedAlarms = localAlarms?.slice()?.sort((a, b) => a.rank?.localeCompare(b.rank))


    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <Box sx={{display: 'flex', padding: '6px'}}>
                <TextField size="small" fullWidth label="Search" />
            </Box>
            {/* <DragContext></DragContext> */}
            <TableContainer>
                <Table size="small" stickyHeader>
                    <TableHead sx={{color: 'white', bgcolor: 'secondary.main'}}>
                        <TableCell sx={{padding: 0, width: '10px', bgcolor: 'secondary.main'}}>

                        </TableCell>
                        <TableCell sx={{color: 'white', padding: '3px', bgcolor: 'secondary.main'}}>
                            Title
                        </TableCell>
                       
                        <TableCell size='small'  sx={{width: '40px', bgcolor: 'secondary.main'}}>

                        </TableCell>
                    </TableHead>
                    <TableBody>
                            {sortedAlarms.map((alarm) => (
                                <TableRow key={alarm.id}>
                                    <TableCell sx={{padding: 0, display: 'flex', alignItems: 'center'}}>
                                        <IconButton size="small">
                                            <DragIndicator fontSize={'inherit'} />
                                        </IconButton>
                                    </TableCell>
                                    <TableCell sx={{padding: 0,}}>
                                        <TextField 
                                            variant="standard"
                                            fullWidth 
                                            size="small" 
                                            value={alarm.title}
                                            onChange={(e) => {
                                                debounceUpdate(({
                                                    variables: {
                                                        program: props.program,
                                                        id: alarm.id,
                                                        input: {
                                                            title: e.target.value
                                                        }
                                                    }
                                                }))
                                            }}/>
                                    </TableCell>
                                    
                                    
                                    <TableCell size='small' sx={{ width: '40px', padding: 0}}>
                                        <IconButton onClick={() => navigate(`${alarm.id}/conditions`)} size="small">
                                            <MoreVert fontSize='inherit' />
                                        </IconButton>
                                        <IconButton size="small">
                                            <Delete onClick={() => {
                                                deleteAlarm({variables: { program: props.program, id: alarm.id }})
                                            }} fontSize='inherit' />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                    
                    </TableBody>
                </Table>
            </TableContainer>
            <Button onClick={() => {
                createAlarm({variables: {program: props.program, input: {title: ''}}})
            }}>Add</Button>

        </Box>
    )
}