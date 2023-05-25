import Checkbox from '@mui/material/Checkbox';
import { Box } from '@mui/material'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField/TextField';
import React, { useState } from 'react';

export const TagTable = (props: {
    tags: { name: string, type: string }[],
    types: { name: string }[]
    importTypes: { name: string }[]
    importTags: {name: string}[]
    onImportTagChanged: (tag: string) => void;
}) => {

    const [ search, setSearch ] = useState('');

    // const [ tags ] = useState<any[]>(['PMP101', 'PMP102', 'PMP201', 'PMP301', 'PMP401']);

    console.log(props.importTypes, props.types, props.tags)

    const filterTag = (tag: any) => {
        let isAllowed = false;

        let isType = props.types.findIndex((a) => a.name == tag.type) > -1;
        if (isType) {
            isAllowed = props.importTypes.findIndex((a) => a.name?.split('.')?.[0] == tag.type) > -1;
        }else{
            isAllowed = true;
        }

        if(search && search.length > 0){
            isAllowed = tag.name.indexOf(search) > -1
        }
        return isAllowed;
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
                <TableHead>
                    <TableRow>
                        <TableCell sx={{bgcolor: 'secondary.main'}}>Include</TableCell>
                        <TableCell sx={{bgcolor: 'secondary.main'}}>Tag</TableCell>
                        <TableCell sx={{bgcolor: 'secondary.main'}}>Type</TableCell>
                        <TableCell sx={{bgcolor: 'secondary.main'}}>Comment</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.tags.filter(filterTag).sort((a, b) => a.type?.localeCompare(b.type)).map((tag) => (
                        <TableRow>
                            <TableCell sx={{ width: '40px' }}>
                                <Checkbox checked={props.importTags.find((a) => a.name == tag.name) != null} onChange={(e) => {
                                    props.onImportTagChanged(tag.name)
                                }} />
                            </TableCell>
                            <TableCell>{tag.name}</TableCell>
                            <TableCell>{tag.type}</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            </Box>
        </Box>

    )
}