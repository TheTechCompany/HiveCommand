import { Box, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Check } from '@mui/icons-material'
export const FieldValue = (props: any) => {

    const { label, value: _value } = props;

    const [value, setValue] = useState(_value);

    useEffect(() => {
        setValue(_value)
    }, _value)

    switch (props.type) {
        case 'Number':
            return (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                        type="number"
                        size="small"
                        InputProps={{
                            endAdornment: <InputAdornment position='end'>
                                <IconButton onClick={() => {
                                    props.onChange?.(value)
                                }} size="small">
                                    <Check fontSize='inherit' />
                                </IconButton>
                            </InputAdornment>
                        }}
                        label={label}
                        value={value}
                        onChange={(e) => setValue(e.target.value)} />

                </Box>
            )
    }

    return (
        <Typography>{`${value}`}</Typography>
    )
}