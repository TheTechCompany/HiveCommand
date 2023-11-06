import React, { useEffect, useMemo, useState } from 'react';
import { IconButton, Autocomplete, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Paper } from '@mui/material'
import { createFilterOptions } from '@mui/material/Autocomplete'
import { ImportExport, Close } from '@mui/icons-material'

import { DataTypes } from '@hive-command/scripting'

import { buildSchema } from 'graphql'
import { useCreateTag, useDeleteTag, useUpdateTag } from './api';
import { useCommandEditor } from '../../context';

import { debounce } from 'lodash';
import { ExportModal } from './importexport';
import { ImportModal } from './import-modal'
import { gql, useMutation } from '@apollo/client';
import { useParams } from 'react-router-dom';
// interface AV101 {
//     name: string[];
// }

const filter = createFilterOptions();

export const TagEditor = (props: any) => {

    const { id } = useParams()

    const [ search, setSearch ] = useState('');

    const [ importModalOpen, openImportModal ] = useState(false);

    const { tags, types: extraTypes } = props;

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

    const { program: {dataScopes} = {}, refetch } = useCommandEditor()

    const dataTypes = useMemo(() => {
        let entries = Object.entries(DataTypes);
        let types : any[] = [];
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
                program: id,
                id: tagId,
                input: row
            }
        })
        //.then(() => refetch())
    }


    const [ importTypes ] = useMutation(gql`
        mutation ImportTypes($program: ID, $input: [CommandProgramTypeInput], $scope: String){
            importCommandProgramTypes(program: $program, input: $input, scope: $scope){
                id
                name
            }
        }
    `)

    const [ importTags ] = useMutation(gql`
        mutation ImportTags($program: ID, $input: [CommandProgramTagInput], $scope: String){
            importCommandProgramTags(program: $program, input: $input, scope: $scope){
                id
                name
            }
        }
    `)


    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>

            <ImportModal 
                open={importModalOpen}
                tags={tags}
                types={extraTypes}
                dataScopes={dataScopes || []}
                onSubmit={(tags, types, scope) => {
                    importTypes({
                        variables: {
                            program: id,
                            input: types,
                            scope
                        }
                    }).then(() => {
                        importTags({
                            variables: {
                                program: id,
                                input: tags,
                                scope
                            }
                        }).then(() => {
                            openImportModal(false);
                            refetch?.()
                        })
                    })
                }}
                onClose={() => {
                    openImportModal(false)
                }} />
            <ExportModal />

            <Box sx={{display: 'flex', padding: '6px'}}>
                <TextField 
                    label="Search" 
                    size="small" 
                    value={search} 
                    fullWidth
                    onChange={(e) => setSearch(e.target.value)} />
                <IconButton onClick={() => openImportModal(true)}>
                    <ImportExport />
                </IconButton>
            </Box>
            <TableContainer>
                <Table size='small' stickyHeader>
                    <TableHead sx={{bgcolor: 'secondary.main'}}>
                        <TableRow>
                            <TableCell sx={{padding: 0, width: '10px', bgcolor: 'secondary.main'}}>

                            </TableCell>
                            <TableCell sx={{padding: '3px', bgcolor: 'secondary.main'}}>
                                Tag name
                            </TableCell>
                            <TableCell sx={{padding: '3px', bgcolor: 'secondary.main'}}>
                                Datatype
                            </TableCell>
                            <TableCell sx={{padding: '3px', bgcolor: 'secondary.main'}}>
                                Scope
                            </TableCell>
                            <TableCell sx={{padding: 0, bgcolor: 'secondary.main'}}>

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
                                <TableCell sx={{padding: 0, width: '10px', cursor: 'pointer', borderRight: '2px solid #dfdfdf'}}>
                                    {/* <Paper sx={{height: '30px', borderBottomLeftRadius: 0, borderTopLeftRadius: 0}} elevation={3}></Paper> */}
                                </TableCell>
                                <TableCell sx={{padding: '0px', paddingLeft: '6px', paddingRight: 0, borderRight: '2px solid #dfdfdf'}}>
                                    <TextField 
                                        // sx={{lineHeight: '1em', fontSize: '0.8rem'}}
                                        fullWidth
                                        size="small"
                                        variant="standard"
                                        onChange={(e) => {
                                            updateRow(tag.id, {name: e.target.value})
                                        }}
                                        value={tag.name} />
                                </TableCell>
                                <TableCell sx={{padding: '0px', paddingRight: 0,  borderRight: '2px solid #dfdfdf'}}>
                                    <Autocomplete 
                                        // sx={{height: '1em', fontSize: '0.8rem'}}
                                        fullWidth
                                        size="small"
                                        onChange={(evt, value) => {
                                            console.log(value)
                                            updateRow(tag.id, {type: value.id})
                                        }}
                                        value={dataTypes.find((a) => a.name === tag.type)}
                                        renderInput={(params) => <TextField {...params} variant='standard' />}
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
                                <TableCell sx={{ minWidth: '200px', padding: '0px', paddingRight: 0}}>
                                    <Autocomplete 
                                        fullWidth
                                        size="small"
                                        onChange={(evt, value) => {
                                            console.log(value)
                                            updateRow(tag.id, {scope: typeof(value) === 'string' ? value : value?.id})
                                        }}
                                        value={dataScopes?.find((a) => a.id === tag.scope?.id)}
                                        renderInput={(params) => <TextField {...params} variant='standard' />}
                                        options={dataScopes || []}
                                        getOptionLabel={(option) => typeof(option) === 'string' ? option : option.name}
                                        // filterOptions={(options, params) => {
                                        //     const filtered = filter(options, params);
                                    
                                        //     const { inputValue } = params;
                                        //     // Suggest the creation of a new value
                                        //     const isExisting = options.some((option) => inputValue === option.id);
                                        //     if (inputValue !== '' && !isExisting) {
                                        //     filtered.push({
                                        //         inputValue,
                                        //         title: `Add "${inputValue}"`,
                                        //     });
                                        //     }
                                    
                                        //     return filtered;
                                        // }}
                                        />
                                </TableCell>
                                <TableCell sx={{width: '30px', padding: 0}}>
                                        <IconButton 
                                            onClick={() => {
                                                deleteTag({
                                                    variables: {
                                                        program: id,
                                                        id: tag.id
                                                    }
                                                }).then(() => {
                                                    refetch?.()
                                                });
                                            }}
                                            size="small" color="error" >
                                            <Close fontSize='inherit' />
                                        </IconButton>
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
                                program: id,
                                input: {name: ''}
                            }
                        }).then(() => refetch?.())
                    }}
                    fullWidth>Add tag</Button>
            </Box>
        </Box>
    )
}