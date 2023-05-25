import {Box, Typography} from "@mui/material";
import { useDropzone } from 'react-dropzone'
import React, { useCallback } from "react";
import Papa from 'papaparse'
import { Document } from '@allenbradley/l5x';

export const UploadView = (props: {file: any, onChange: (file: any) => void}) => {


    const onDrop = useCallback((acceptedFiles: File[]) => {
        // Do something with the files
        let file = acceptedFiles[0];

        const reader = new FileReader()

        reader.onabort = () => console.log('file reading was aborted')
        reader.onerror = () => console.log('file reading has failed')
        reader.onload = () => {
        // Do whatever you want with the file contents
            const binaryStr = reader.result.toString()

            props.onChange({name: file.name, content: binaryStr});


            
        }

        reader.readAsText(file, 'utf8')

      }, [])

      const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, accept: ['.csv', '.l5x'] })
    

    return (
        <Box sx={{border: '1px dashed black', paddingLeft: '6px', paddingRight: '6px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100px'}} {...getRootProps()}>
            <input {...getInputProps()} />
            <Typography>{isDragActive ? 'Drop' : 'Drag'} tag file here...</Typography>
        </Box>
    )
}