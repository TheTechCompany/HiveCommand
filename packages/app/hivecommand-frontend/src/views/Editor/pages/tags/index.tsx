import React, { useEffect, useMemo, useState } from 'react';
import { Autocomplete, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material'
import { createFilterOptions } from '@mui/material/Autocomplete'

import { DataTypes } from '@hive-command/scripting'

import { buildSchema } from 'graphql'
import { useCreateTag, useDeleteTag, useUpdateTag } from './api';
import { useCommandEditor } from '../../context';

import { debounce } from 'lodash';
// interface AV101 {
//     name: string[];
// }

const filter = createFilterOptions();

export const TagEditor = (props: any) => {

    const [ search, setSearch ] = useState('');

    const { program, tags, types: extraTypes } = props;

    const createTag = useCreateTag();
    const updateTag = useUpdateTag();
    const debounceUpdateTag = useMemo(() => debounce(updateTag, 200) ,[])
    const deleteTag = useDeleteTag();

    // const tags = [
    //     {name: 'AV101'}
    // ];

    const [tagState, setTagState] = useState<any[]>(tags || []);


    useEffect(() => {
        setTagState(tags)
    }, [tags])

    // const av101 = Object.entries(AV101['name'])

    const { refetch } = useCommandEditor()

    const dataTypes = useMemo(() => {
        let entries = Object.entries(DataTypes);
        let types = [];
        for(const [propertyKey, propertyValue] of entries){
            types.push({name: propertyKey, id: propertyKey})
            types.push({name: `${propertyKey}[]`, id: `${propertyKey}[]`})
        }

        types = types.concat(extraTypes.map((x) => ({...x, id: `type://${x.id}`}) ))

        return types;
    }, [DataTypes, extraTypes])

    console.log({dataTypes})

    const updateRow = ( tagId: string, row: any ) => {

        setTagState((tags) => {
            let newTags = tags.slice();
            let ix = newTags.findIndex((a) => a.id === tagId);
            newTags[ix] = {
                ...newTags[ix],
                ...row
            }
            return newTags
        })

        debounceUpdateTag({
            variables: {
                program,
                id: tagId,
                input: row
            }
        })
        //.then(() => refetch())
    }

    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <TextField 
                label="Search" 
                size="small" 
                value={search} 
                fullWidth
                onChange={(e) => setSearch(e.target.value)} />
            <TableContainer>
                <Table stickyHeader>
                    <TableHead sx={{bgcolor: 'secondary.main'}}>
                        <TableRow>
                            <TableCell sx={{padding: '6px', bgcolor: 'secondary.main'}}>
                                Tag name
                            </TableCell>
                            <TableCell sx={{padding: '6px', bgcolor: 'secondary.main'}}>
                                Datatype
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody sx={{overflowY: 'auto'}}>
                        {tagState.slice()?.filter((a) => {
                            if(search && search.length > 0){
                                return a.name?.indexOf(search) > -1
                            }
                            return true;
                        })?.sort((a, b) => a.name?.localeCompare(b.name)).map((tag) => (
                            <TableRow key={tag.id || tag.name}>
                                <TableCell sx={{padding: '6px'}}>
                                    <TextField 
                                        // sx={{lineHeight: '1em', fontSize: '0.8rem'}}
                                        fullWidth
                                        size="small"
                                        onChange={(e) => {
                                            updateRow(tag.id, {name: e.target.value})
                                        }}
                                        value={tag.name} />
                                </TableCell>
                                <TableCell sx={{padding: '6px'}}>
                                    <Autocomplete 
                                        // sx={{height: '1em', fontSize: '0.8rem'}}
                                        fullWidth
                                        size="small"
                                        onChange={(evt, value) => {
                                            console.log(value)
                                            updateRow(tag.id, {type: value.id})
                                        }}
                                        value={dataTypes.find((a) => a.name === tag.type)}
                                        renderInput={(params) => <TextField {...params} />}
                                        options={dataTypes}
                                        getOptionLabel={(option) => option.inputValue ? option.title : option.name}
                                        filterOptions={(options, params) => {
                                            const filtered = filter(options, params);
                                    
                                            const { inputValue } = params;
                                            // Suggest the creation of a new value
                                            const isExisting = options.some((option) => inputValue === option.id);
                                            if (inputValue !== '' && !isExisting) {
                                            filtered.push({
                                                inputValue,
                                                title: `Add "${inputValue}"`,
                                            });
                                            }
                                    
                                            return filtered;
                                        }}
                                        />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box>
                <Button 
                    onClick={() => {
                        createTag({
                            variables: {
                                program: program,
                                input: {name: ''}
                            }
                        }).then(() => refetch())
                    }}
                    fullWidth>Add tag</Button>
            </Box>
        </Box>
    )
}