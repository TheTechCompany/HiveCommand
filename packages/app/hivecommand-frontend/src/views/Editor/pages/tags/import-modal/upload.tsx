import {Box, IconButton, Paper, Typography} from "@mui/material";
import { useDropzone } from 'react-dropzone'
import React, { useCallback } from "react";
import Papa from 'papaparse'
import { Document } from '@allenbradley/l5x';
import { Close } from '@mui/icons-material'

export const UploadView = (props: {file: {name: string, size?: number, content: string}, onChange: (file: any) => void}) => {


    const onDrop = useCallback((acceptedFiles: File[]) => {
        // Do something with the files
        let file = acceptedFiles[0];

        const reader = new FileReader()

        reader.onabort = () => console.log('file reading was aborted')
        reader.onerror = () => console.log('file reading has failed')
        reader.onload = () => {
        // Do whatever you want with the file contents
            const binaryStr = reader.result.toString()

            props.onChange({name: file.name, size: file.size, content: binaryStr});
            
        }

        reader.readAsText(file, 'utf8')

      }, [])

      const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, accept: ['.l5x'] })
    

    return props.file ? (
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
        <Box sx={{border: '1px dashed black', marginLeft: '6px', marginRight: '6px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100px'}} {...getRootProps()}>
            <input {...getInputProps()} />
            <Typography>{isDragActive ? 'Drop' : 'Drag'} tag file here...</Typography>
        </Box>
    )
}