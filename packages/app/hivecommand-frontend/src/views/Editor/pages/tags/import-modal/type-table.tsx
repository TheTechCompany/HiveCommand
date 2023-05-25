import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Box, TextField } from '@mui/material'
import { ChevronRight, ExpandMore } from '@mui/icons-material'
import React, { useState } from 'react';
import Collapse from '@mui/material/Collapse/Collapse';
import Typography from '@mui/material/Typography/Typography';

export const TypeTable = (props: { types: any[], importTypes: any[], onImportTypeChanged: (type: string, on?: boolean) => void }) => {


    const [ search, setSearch ] = useState('');

    const [expanded, setExpanded] = useState()

    const toggleType = (tag: { name: string, fields: { name: string }[] }, on: boolean) => {
        tag.fields.forEach((field) => {
            props.onImportTypeChanged(`${tag.name}.${field.name}`, on)
        })
    }

    const filterType = (type: any) => {
        if(search && search.length > 0){
            return type.name.indexOf(search) > -1;
        }
        return true;
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Box sx={{ paddingLeft: '6px', paddingRight: '6px'}}>
                <TextField 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{marginBottom: '6px'}} 
                    fullWidth 
                    size="small" 
                    label="Search" />
            </Box>
            <Box sx={{maxHeight: '350px', overflowY: 'auto'}}>
            <Table size="small" stickyHeader>
                <TableHead >
                    <TableRow>
                        <TableCell sx={{bgcolor: 'secondary.main'}}>Include</TableCell>
                        <TableCell sx={{bgcolor: 'secondary.main'}}>Name</TableCell>
                        <TableCell sx={{bgcolor: 'secondary.main'}}>Comment</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.types?.filter(filterType)?.map((tag) => {
                        const indeterminate = props.importTypes.filter((a) => a.name?.split('.')[0]?.indexOf(tag.name) > -1).length > 0;
                        const checked = props.importTypes.filter((a) => a.name?.split('.')[0]?.indexOf(tag.name) > -1).length === tag?.fields?.length
                        // console.log(
                        //     props.importTypes.filter((a) => a.name?.split('.')[0]?.indexOf(tag.name) > -1).length,
                        //     tag?.fields?.length
                        // )
                        return (<>
                            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                                <TableCell sx={{ width: "100px", borderBottom: 'unset' }}>
                                    <Checkbox
                                        indeterminate={!checked && indeterminate}
                                        checked={checked}
                                        onChange={(e) => toggleType(tag, e.target.checked)}
                                    />
                                    <IconButton onClick={() => setExpanded(expanded == tag ? undefined : tag)}>
                                        {expanded == tag ? (
                                            <ExpandMore />
                                        ) : (<ChevronRight />)}
                                    </IconButton>
                                </TableCell>
                                <TableCell>{tag.name}</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                            <TableRow>
                                {/* <TableCell></TableCell> */}
                                <TableCell sx={{ padding: 0 }} colSpan={3}>

                                    <Collapse in={expanded == tag}>
                                        <Box sx={{ flexDirection: 'column', display: 'flex' }}>
                                            {tag?.fields?.map((field) => (
                                                <Box sx={{ paddingLeft: '55px', display: 'flex', alignItems: 'center' }}>
                                                    <Checkbox
                                                        checked={props.importTypes.findIndex((a) => a.name === `${tag.name}.${field.name}`) > -1}
                                                        onChange={(e) => {
                                                            props.onImportTypeChanged(`${tag.name}.${field.name}`)
                                                        }} sx={{ marginRight: '50px' }} />
                                                    <Typography sx={{ fontSize: '12px' }}>{field.name} - {field.type}</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Collapse>
                                </TableCell>
                            </TableRow>
                        </>)
                    })}
                </TableBody>
            </Table>
            </Box>
        </Box>

    )
}