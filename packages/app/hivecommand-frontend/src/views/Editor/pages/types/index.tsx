import React, { useEffect, useMemo, useState } from 'react';
import { Autocomplete, Box, Button, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useCreateTypeField, useDeleteTypeField, useUpdateTypeField } from './api';
import { useCommandEditor } from '../../context';
import { debounce } from 'lodash'
import { DataTypes } from '@hive-command/scripting';

export const TypeEditor = (props: any) => {

    const { refetch } = useCommandEditor()

    const { types, active } = props;

    const scalarTypes = Object.keys(DataTypes);

    const activeType = types?.find((a) => a.id === active);

    const [typeFields, setTypedFields] = useState<any[]>(activeType?.fields || []) //activeType?.fields || [{name: 'Field', type: 'String'}];

    useEffect(() => {
        setTypedFields(activeType.fields)
    }, [activeType.fields])

    const createTypeField = useCreateTypeField(active)
    const updateTypeField = useUpdateTypeField(active)
    const deleteTypeField = useDeleteTypeField(active)

    const debouncedTypeField = useMemo(() => debounce(updateTypeField, 200), [])

    const updateField = (id: string, value: any) => {

        setTypedFields((fields) => {
            let newFields = fields.slice()
            let ix = newFields.findIndex((a) => a.id === id)
            newFields[ix] = {
                ...newFields[ix],
                ...value
            }
            return newFields;
        })

        debouncedTypeField(id, value)
    }

    return (
        <Box sx={{flex: 1}}>
            <Box sx={{padding: '6px'}}>
                <Typography>{activeType.name}</Typography>
            </Box>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{padding: '6px'}}>
                            Name
                        </TableCell>
                        <TableCell sx={{padding: '6px'}}>
                            Datatype
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {typeFields.map((field) => (
                        <TableRow>
                            <TableCell sx={{padding: '6px'}}>
                                <TextField 
                                    onChange={(e) => {
                                        updateField(field.id, {name: e.target.value})
                                    }}
                                    fullWidth
                                    size="small" 
                                    value={field.name} />
                            </TableCell>
                            <TableCell sx={{padding: '6px'}}>
                                <Autocomplete
                                    size="small"
                                    value={field.type}
                                    renderInput={(params) => <TextField {...params} />}
                                    options={scalarTypes.concat(scalarTypes.map((x) => `${x}[]`))}
                                    onChange={(e, newValue) => {
                                        updateField(field.id, {type: newValue})
                                    }}
                                    // value={field.type}
                                     />
                                {/* {field.type} */}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Box>
                <Button 
                    onClick={() => {
                        createTypeField({name: ''}).then(() => refetch())
                    }}
                    fullWidth>Add field</Button>
            </Box>
        </Box>
    )
}