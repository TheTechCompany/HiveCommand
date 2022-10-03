import React, { useState } from 'react';
import moment from 'moment';
import {Add, MoreVert, Search} from '@mui/icons-material'
import { Box, Typography, Button, Table, TableBody, TableContainer, Checkbox, TableCell, TableRow, Paper, TableHead, IconButton, Menu, MenuItem } from '@mui/material'

export interface DeploymentListProps {
    onClickRow?: (row: any) => void;
    onEditRow?: (row: any) => void;

    onMapRow?: (row: any) => void;

    programs?: any[];
    devices?: any[];

    selected?: string[];

    onCreate?: () => void;
}


export const DeploymentList : React.FC<DeploymentListProps> = (props) => {

    const [ editElem, setEditElem ] = useState<any>(null);
    const [ editAnchor, setEditAnchor ] = useState<any>(null);

    const columns = [
        {
            property: 'name',
            align: 'left',
            size: 'medium',
            header: (
                 <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <Typography>Name</Typography>
                    {/* <IconButton sx={{color: "#fff"}} >
                        <Search />
                    </IconButton> */}
                 </Box>
            )
        },
        {
            property: 'activeProgram',
            size: 'medium',
            align: 'left',
            render: (datum) => datum?.activeProgram?.name,
            header: <Typography>Program</Typography>
        },
        {
            size: 'small',
            property: 'connected',
            align: 'left',
            header: <Typography>Connection</Typography>,
            render: (datum) => (
                <Box 
                    sx={{flexDirection: 'row', display: 'flex', alignItems: 'center'}} >
                    <Box 
                        sx={{
                            width: 7,
                            height: 7,
                            borderRadius: 7,
                            marginRight: '6px',
                            background: datum.online ? 'green' : 'red'
                        }}/>
                    {datum.online ? 'Online' : 'Offline'}
                </Box>
            )
        },
        {  
            property: 'lastSeen',
            align: 'center',
            size: 'medium',
            header: <Typography>Last Seen</Typography>,
            render: (datum) => moment(datum.lastSeen).fromNow()
        },
        {
            property: 'edit',
            align: 'right',
            size: 'small',
            header: (
                <IconButton 
                    onClick={props.onCreate}
                    sx={{color: "#fff"}}>
                    <Add />
                </IconButton>
            ),
            render: (datum) => (
                <IconButton
                    onClick={(e) => {
                        e.stopPropagation();

                        setEditAnchor(e.target);
                        setEditElem(datum)
                        // props.onEditRow?.(datum)
                    }}
                    >
                    <MoreVert />
                </IconButton> 
            )
        }  
    ]

    return (
        <Box 
            sx={{flex: 1, display: 'flex'}}>

            <Menu 
                anchorEl={editAnchor}
                open={Boolean(editAnchor)} 
                onClose={() => {
                    setEditElem(null);
                    setEditAnchor(null)
                }}>
                <MenuItem onClick={() => {
                    setEditElem(null);
                    setEditAnchor(null)
                    props.onEditRow?.(editElem)
                }}>
                    Edit
                </MenuItem>
                <MenuItem onClick={() => {
                    setEditElem(null);
                    setEditAnchor(null)
                    props.onMapRow?.(editElem)
                }}>
                    Change mapping
                </MenuItem>
            </Menu>
            <TableContainer
                style={{flex: 1, borderRadius: 0}}
                component={Paper}>
                <Table size="medium">
                    <TableHead>
                        <TableRow
                            >
                            {columns.map((column, ix) => (
                                <TableCell 
                                    align={column.align as any} 
                                    size={'small'} 
                                    sx={{color: 'white', padding: 0, paddingLeft: ix == 0 ? '12px' : '0px'}}>
                                        {column.header}
                                </TableCell>  
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
                                {columns.map((column, ix) => (
                                    <TableCell 
                                        size={'small'} 
                                        sx={{ padding: (ix != (columns.length - 1))? '6px' : '0px', paddingLeft: ix == 0 ? '12px' : '0px'}} 
                                        align={column.align as any}>

                                        {column?.render?.(device) || device[column.property]}

                                    </TableCell>
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