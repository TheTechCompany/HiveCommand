import { Box, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Check } from '@mui/icons-material'
export const FieldValue = (props: any) => {

    const { label, value: _value } = props;

    const [ editing, setEditing ] = useState(false);

    const [ value, setValue ] = useState(_value);

    useEffect(() => {
        setValue(_value)
    }, [_value])

    const onChange = () => {
        props.onChange?.(value)
        setEditing(false)
    }

    switch (props.type) {
        case 'Number':
            return (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                        type="number"
                        size="small"
                        InputProps={{
                            endAdornment: editing ? <InputAdornment position='end'>
                                <IconButton onClick={onChange} size="small">
                                    <Check fontSize='inherit' />
                                </IconButton>
                            </InputAdornment> : null
                        }}
                        label={label}
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value)
                            setEditing(true)
                        }} />

                </Box>
            )
    }

    return (
        <Typography>{`${value}`}</Typography>
    )
}