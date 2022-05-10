import React from 'react';
import { Box, DataTable, Text, CheckBox, Button } from 'grommet';
import moment from 'moment';
import {MoreVert} from '@mui/icons-material'
import { Table, TableBody, TableContainer, TableCell, TableRow, Paper, TableHead } from '@mui/material'
import { BaseStyle } from '@hexhive/styles';

export interface DeploymentListProps {
    onClickRow?: (row: any) => void;
    onEditRow?: (row: any) => void;

    programs?: any[];
    devices?: any[];

    selected?: string[];
}


export const DeploymentList : React.FC<DeploymentListProps> = (props) => {

    const columns = [
        {
            property: 'selected',
            render: (datum) => <CheckBox checked={(props.selected || []).indexOf(datum.id) > -1} />,
            header: <CheckBox />
        },
        {
            property: 'name',
            size: 'medium',
            header: <Text>Name</Text>
        },
        {
            property: 'activeProgram',
            size: 'small',
            render: (datum) => datum?.activeProgram?.name,
            header: <Text>Program</Text>
        },
        {
            size: 'small',
            property: 'connected',
            align: 'center',
            header: <Text>Connection</Text>,
            render: (datum) => (
                <Box 
                    direction="row"
                    align="center"
                    round="small"  >
                    <Box 
                        margin={{right: 'small'}}
                        width="7px" 
                        height="7px" 
                        round="small" 
                        background={datum.online ? 'green' : 'red'} />
                    {datum.online ? 'Online' : 'Offline'}
                </Box>
            )
        },
        {  
            property: 'lastSeen',
            align: 'end',
            size: 'small',
            header: <Text>Last Seen</Text>,
            render: (datum) => moment(datum.lastOnline).fromNow()
        },
        {
            property: 'edit',
            align: 'end',
            size: 'small',
            render: (datum) => (
            <Button 
                plain
                style={{padding: 6, borderRadius: 3}}
                onClick={(e) => {   
                    e.stopPropagation();
                    props.onEditRow?.(datum)
                }}
                hoverIndicator 
                icon={<MoreVert fontSize='small'/>} />
            )
        }   
    ]

    return (
        <Box 
            
            background={'neutral-1'}
            elevation="small"
            flex>
            <TableContainer
                style={{flex: 1}}
                component={Paper}>
                <Table size="medium">
                    <TableHead style={{background: BaseStyle.global.colors['accent-2']}}>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell style={{color: 'white'}}>{column.header}</TableCell>  
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {props.devices?.map((device) => (
                            <TableRow
                                style={{cursor: 'pointer'}}
                                hover 
                                onClick={() => props.onClickRow?.({datum: device})}
                                key={device.id}>
                                {columns.map((column) => (
                                    <TableCell>{column?.render?.(device) || device[column.property]}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                {/* </Table>
                    
                    onClickRow={props.onClickRow}
                    data={props.devices?.map((x) => ({...x}))}
                    columns={} /> */}
                </Table>
            </TableContainer>
        </Box>
    )
}