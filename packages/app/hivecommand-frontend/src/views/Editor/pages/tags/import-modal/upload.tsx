import {Autocomplete, Box, Divider, IconButton, Paper, TextField, Typography} from "@mui/material";
import { useDropzone } from 'react-dropzone'
import React, { useCallback } from "react";
import Papa from 'papaparse'
import { Document } from '@allenbradley/l5x';
import { Close } from '@mui/icons-material'

export const UploadView = (props: {
    file: {
        name: string, 
        size?: number, 
        content: string
    }, 
    scope: string,
    dataScopes: {
        id: string,
        name: string,
        plugin: {
            id: string,
            name: string
        }
    }[]
    onChange: (patch: {file?: any, scope?: string}) => void
}) => {

    const onDrop = useCallback((acceptedFiles: File[]) => {
        // Do something with the files
        let file = acceptedFiles[0];

        const reader = new FileReader()

        reader.onabort = () => console.log('file reading was aborted')
        reader.onerror = () => console.log('file reading has failed')
        reader.onload = () => {
        // Do whatever you want with the file contents
            const binaryStr = reader.result.toString()

            props.onChange({
                file: {
                    name: file.name, 
                    size: file.size, 
                    content: binaryStr
                }
            });
            
        }

        reader.readAsText(file, 'utf8')

      }, [])

      const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, accept: ['.l5x'] })
    

    return (
        <Box sx={{display: 'flex', flexDirection: 'column'}}>
        {props.file ? (
            <Box sx={{minHeight: '200px', padding: '6px'}}>
                <Paper elevation={4} sx={{display: 'flex', paddingLeft: '6px', paddingRight: '6px', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Box>
                        <Typography>{props.file.name}</Typography>
                        <Typography fontSize={'small'}>{(props.file?.size / 1024 / 1024).toFixed(2)}MB</Typography>
                    </Box>
                    <IconButton 
                        onClick={() => {
                            props.onChange(null)
                        }}
                        size="small">
                        <Close fontSize="inherit" />
                    </IconButton>
                </Paper>
            </Box>
        ) : (
            <Box>
            
                <Box sx={{border: '1px dashed black', margin: '6px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100px'}} {...getRootProps()}>
                    <input {...getInputProps()} />
                    <Typography>{isDragActive ? 'Drop' : 'Drag'} tag file here...</Typography>
                </Box>
            </Box>

        )}

        <Autocomplete
            sx={{
                margin: '6px',
                marginTop: '12px'
            }}
            value={props.dataScopes.find((a) => a.id == props.scope) || null}
            onChange={(e, value) => {
                props.onChange({scope: typeof(value) == 'string' ? value : value.id})
            }}
            options={props.dataScopes || []}
            getOptionLabel={(option) => typeof(option) === 'string' ? option : option.name}
            renderInput={(params) => <TextField {...params} label="Scope (optional)" size="small" />}
            />
    </Box>
    )
}