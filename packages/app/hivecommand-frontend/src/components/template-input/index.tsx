import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import { Cancel } from '@mui/icons-material'

import React, { useEffect, useState } from 'react';
import { Editor } from '../script-editor/editor';
import { BaseTemplateInput } from './input';

export interface TemplateInputProps {
    value: string;
    onChange?: (value: string) => void;

    label?: string;
    options?: {label: string, type: string}[]
}

export const TemplateInput: React.FC<TemplateInputProps> = (props) => {

    const [value, setValue] = useState(props.value);

    useEffect(() => {
        setValue(props.value)
    }, [props.value])

    const [focused, setFocused] = useState(false);

    const handleFocus = () => {
        setFocused(true)
    }

    const handleBlur = () => {
        setFocused(false);

        props.onChange?.(value);
    }

    return (
        <Box
            className="template-input"
            sx={{ position: 'relative' }}>
            {focused ? (
                <>
                    <TextField size="small" sx={{ opacity: 0, pointerEvents: 'none' }} />

                    <Paper
                        elevation={3}
                        sx={{
                            position: 'absolute',
                            overflowY: 'auto',
                            // overflow: 'visible', 
                            width: '100%',
                            paddingTop: "6px",
                            paddingLeft: '6px',
                            paddingRight: '6px',
                            height: '222%',
                            display: 'flex',
                            zIndex: 9,
                            top: 0,
                            left: 0
                        }}>
                        {/* <Editor
                            value=""
                            extraLib='declare type Device = string | {};' 
                             /> */}
                        <BaseTemplateInput
                            value={props.value}
                            options={props.options}
                            onFocus={(focus) => !focus && handleBlur()}
                            onChange={(e) => setValue(e)} />
                        {/* <TextField 
                            onBlur={handleBlur}
                            multiline 
                            minRows={4}
                            autoFocus
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            label={props.label}
                            variant='standard'/> */}

                        <IconButton
                            onClick={handleBlur}
                            sx={{ position: 'absolute', top: 0, right: 0 }}
                            size="small">
                            <Cancel fontSize='inherit' />
                        </IconButton>
                    </Paper>
                </>
            ) : (
                <TextField
                    size="small"
                    onFocus={handleFocus}
                    label={props.label}
                    value={value}
                // onBlur={handleBlur}
                />
            )}
        </Box>
    )

}