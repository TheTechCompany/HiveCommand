import { Close } from '@mui/icons-material';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TextField, Autocomplete, IconButton, Box, Button } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import { useCreateTypeField, useDeleteTypeField, useUpdateTypeField } from '../api';
import { useCommandEditor } from '../../../context';
import { DataTypes } from '@hive-command/scripting';

export const Properties = (props: {
    types: any[],
    active: any
}) => {

    const { refetch } = useCommandEditor()

    const scalarTypes = Object.keys(DataTypes);

    const { types, active } = props;

    const activeType = types?.find((a) => a.id === active);

    const [typeFields, setTypedFields] = useState<any[]>(activeType?.fields || []) //activeType?.fields || [{name: 'Field', type: 'String'}];

    useEffect(() => {
        setTypedFields(activeType.fields)
    }, [activeType.fields])


    const createTypeField = useCreateTypeField(props.active)
    const updateTypeField = useUpdateTypeField(props.active)
    const deleteTypeField = useDeleteTypeField(props.active)

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
        <Box sx={{ flex: 1, display: 'flex', marginTop: '12px', flexDirection: 'column' }}>
            <TableContainer>
                <Table size="small" stickyHeader>
                    <TableHead sx={{ bgcolor: 'secondary.main' }}>
                        <TableRow>
                            <TableCell sx={{ padding: '6px', bgcolor: 'secondary.main' }}>
                                Name
                            </TableCell>
                            <TableCell sx={{ padding: '6px', bgcolor: 'secondary.main' }}>
                                Datatype
                            </TableCell>
                            <TableCell sx={{ bgcolor: 'secondary.main' }}>

                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody sx={{ overflowY: 'auto' }}>
                        {typeFields.map((field) => (
                            <TableRow>
                                <TableCell sx={{ padding: '6px' }}>
                                    <TextField
                                        onChange={(e) => {
                                            updateField(field.id, { name: e.target.value })
                                        }}
                                        fullWidth
                                        size="small"
                                        variant="filled"
                                        value={field.name} />
                                </TableCell>
                                <TableCell sx={{ padding: '6px' }}>
                                    <Autocomplete
                                        size="small"
                                        value={field.type}
                                        renderInput={(params) => <TextField {...params} variant="filled" />}
                                        options={scalarTypes.concat(scalarTypes.map((x) => `${x}[]`))}
                                        onChange={(e, newValue) => {
                                            updateField(field.id, { type: newValue })
                                        }}
                                    // value={field.type}
                                    />
                                    {/* {field.type} */}
                                </TableCell>
                                <TableCell sx={{ width: '30px' }}>
                                    <IconButton
                                        onClick={() => {
                                            deleteTypeField(field.id).then(() => {
                                                refetch();
                                            })
                                        }}
                                        size="small"
                                        color='error'>
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
                        createTypeField({ name: '' }).then(() => refetch())
                    }}
                    fullWidth>Add field</Button>
            </Box>
        </Box>
    )
}