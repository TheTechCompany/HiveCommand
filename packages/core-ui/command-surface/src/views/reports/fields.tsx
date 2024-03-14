import { Autocomplete, Box, Button, IconButton, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom';
import { DeviceControlContext } from '../../context';
import { Delete } from '@mui/icons-material';
import { debounce } from 'lodash';
import { unit as mathUnit } from 'mathjs'
export const ReportFields = () => {
    const { activePage } = useParams();

    const { activeProgram, reports, client } = useContext(DeviceControlContext);

    const activeReport = reports?.find((a) => a.id == activePage);

    const [ workingReport, setWorkingReport ] = useState<any>({})

    useEffect(() => {
        setWorkingReport(activeReport)
    }, [activeReport])

    const updateField = (field: string, key: string, value: any, updateValue?: any) => {
        let fields = workingReport?.fields?.slice();
        let updateFields = fields?.slice();

        let field_ix = fields?.findIndex((a) => a.id == field);

        console.log("UpdateField", field, key, value, field_ix)

        if(field_ix > -1){
            fields[field_ix] = {
                ...fields[field_ix],
                [key]: value
            }
            updateFields[field_ix] = {
                ...fields[field_ix],
                [key]: updateValue || value
            } 

            setWorkingReport({
                ...workingReport,
                fields: updateFields,
            })

            if(activePage) {
                const update = {
                    device: fields[field_ix].device?.id || fields[field_ix].device ,
                    key: fields[field_ix].key?.id || fields[field_ix].key ,
                    bucket: fields[field_ix].bucket
                }
                debouncedUpdate(activePage, field, update)
            }
        }
    }

    const debouncedUpdate = useMemo(() => debounce(client?.updateReportField || (() => {}), 500), [])

    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <Table size='small'>
                <TableHead>
                    <TableRow>
                        <TableCell width="30%">Device</TableCell>
                        <TableCell width="30%">Key</TableCell>
                        <TableCell width="30%">Bucket</TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {workingReport?.fields?.map((field) => {
                        let timeError = true;
                        try{
                            if(field.bucket) timeError = (mathUnit(field.bucket).to('seconds') == null)
                            timeError = false;
                        }catch(e){
                            timeError = true;
                        }

                        const activeType = activeProgram?.types?.find((a) => field?.device?.type == a.name)

                        console.log({types: activeProgram?.types, activeType, field, type: field.device})

                        return <TableRow>
                            <TableCell padding='none'>
                                <Autocomplete
                                    options={activeProgram.tags || []}
                                    value={activeProgram.tags?.find((a) => a.id == field.device?.id)}
                                    getOptionLabel={(option) => option.name}
                                    onChange={(ev, value) => {
                                        updateField(field?.id, 'device', value.id, {id: value.id})
                                    }}
                                    renderInput={(params) => <TextField {...params} size="small" />} />
                           
                            </TableCell>
                            <TableCell padding='none'>
                                <Autocomplete
                                    options={activeType?.fields || []}
                                    value={activeType?.fields?.find((a) => a.id == field.key?.id)}
                                    getOptionLabel={(option) => option.name}
                                    onChange={(ev, value) => {
                                        updateField(field?.id, 'key', value.id, {id: value.id})
                                    }}
                                    renderInput={(params) => <TextField {...params} size="small" />} />
                              
                            </TableCell>
                            <TableCell padding='none'>
                                <TextField 
                                    fullWidth
                                    size="small" 
                                    error={timeError}
                                    onChange={(e) => {
                                        let valid = false;
                                        try{
                                            if(e.target.value) valid = !(mathUnit(e.target.value).to('seconds') == null)
                                            valid = true;
                                        }catch(e){
                                            valid = false;
                                        }
                                        if(valid){
                                            updateField(field?.id, 'bucket', e.target.value)
                                        }
                                        // updateField(field, 'device', )
                                    }}
                                    value={field.bucket} />
                            </TableCell>
                            <TableCell>
                                <IconButton onClick={() => {
                                    if(activePage){
                                        client?.deleteReportField?.(activePage, field.id)
                                    }
                                }} sx={{color: 'red'}} size='small'>
                                    <Delete fontSize='inherit' />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    })}
                </TableBody>
            </Table>
            <Button onClick={() => {

                if(activePage) client?.createReportField?.(activePage)

            }} fullWidth>Add field</Button>

        </Box>
    );
}