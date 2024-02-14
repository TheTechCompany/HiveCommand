import React, { useEffect, useMemo, useState } from 'react';
import { Box, Table, TableHead, TableCell, TableBody, TableRow, Button, TextField, TableContainer, Select, IconButton, MenuItem, Paper, ListItem, List } from '@mui/material';
import { MoreVert, DragIndicator, Delete, Add } from '@mui/icons-material'
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { Typography } from '@mui/material';
import { AlarmPathwayModal } from '../../../../components/modals/alarm-pathway';
import { useCommandEditor } from '../../context';

export interface AlarmListProps {
    program: string;
    alarms?: any[];
    severities?: any[];
}

export const AlarmList: React.FC<AlarmListProps> = (props) => {

    const navigate = useNavigate();

    const { alarms, severities } = props;

    const [localAlarms, setLocalAlarms] = useState<any[]>([]);

    const [ modalOpen, openModal ] = useState(false);
    
    const { program: {alarmPathways} = {} } = useCommandEditor();

    useEffect(() => {
        setLocalAlarms(alarms || []);
    }, [alarms])

    const [ createPathway ] = useMutation(gql`
        mutation CreateAlarmPathway ($program: ID, $input: CommandProgramAlarmPathwayInput){
            createCommandProgramAlarmPathway(program: $program, input: $input){
                id
            }
        }
    `, {
        refetchQueries: ['EditorCommandProgram']
    })

    const [updateAlarm] = useMutation(gql`
        mutation UpdateAlarm ($program: ID, $id: ID!, $input: CommandProgramAlarmInput){
            updateCommandProgramAlarm(program: $program, id: $id, input: $input){
                id
            }
        }
    `, {
        refetchQueries: ['EditorCommandProgram']
    })

    const _debounceUpdate = useMemo(() => debounce(updateAlarm, 200), [])

    const debounceUpdate = (update: { variables: { program: string, id: string, input: any } }) => {
        let _alarms = localAlarms.slice();

        let ix = _alarms?.findIndex((a) => a.id == update.variables.id);

        if (ix > -1) {
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
    const [deleteAlarm] = useMutation(gql`
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
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <AlarmPathwayModal
                open={modalOpen}
                onSubmit={(pathway) => {
                    createPathway({
                        variables: {
                            program: props.program,
                            input: pathway
                        }
                    }).then(() => {
                        openModal(false)
                    })
                }}
                onClose={() => {
                    openModal(false);
                }}
                />
            <Box sx={{ display: 'flex', padding: '3px', bgcolor: 'secondary.main', color: 'white', alignItems: 'center', justifyContent: 'space-between' }} >
                <Typography>Notification Pathways</Typography>
                <IconButton
                    onClick={() => {
                        // openDataScopeModal(true);
                        openModal(true)
                    }}
                    sx={{ color: "white" }} size="small">
                    <Add fontSize="inherit" />
                </IconButton>
            </Box>

            <List>
                {alarmPathways?.map((pathway) => (
                    <ListItem>{pathway.name}</ListItem>
                ))}
            </List>
        </Box>
    )
}