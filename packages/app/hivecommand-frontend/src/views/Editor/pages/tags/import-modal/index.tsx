import React, { useState } from 'react';
import { ImportView } from './import';
import { UploadView } from './upload';
import {Dialog, DialogTitle, DialogContent, DialogActions, Button} from '@mui/material';
import { useMutation, gql } from '@apollo/client'

export interface ImportModalProps {
    open: boolean;
    tags?: {id: string, name: string}[];
    types?: {
        id: string;
        name: string;
        fields?: {
            id: string
            name: string
            type: string
        }[]
    }[];
    onSubmit?: (
        tags: {name: string, type: string}[],
        types: {name: string, fields: {name: string, type: string}[]}[]
    ) => void;
    onClose?: () => void;
}

export const ImportModal : React.FC<ImportModalProps> = (props) => {

    const [ view, setView ] = useState<'import' | 'upload'>('upload');

    const [ file, setFile ] = useState<{name: string, size?: number, content: string} | null>(null)

    const [ importMap, setImportMap ] = useState<{
        tags: {name: string, type: string}[],
        types: { name: string, fields: {name: string, type: string}[] }[]
    }>({
        tags: [],
        types: []
    })


    const importFile = () => {
        //Compare importMap to props.tags and props.types
        const newTags = importMap.tags?.filter((a) => props.tags?.findIndex((tag) => tag?.name === a?.name) < 0)
        const removedTags = props.tags?.filter((a) => importMap.tags?.findIndex((tag) => tag?.name === a?.name) < 0)

        const newTypes = importMap.types?.filter((a) => props.types?.findIndex((type) => type?.name == a?.name) < 0)
        const removedTypes = props.types?.filter((a) => importMap.types?.findIndex((type) => type?.name === a?.name) < 0)

        console.log({newTags, removedTags, newTypes, removedTypes})
        //Send new additions and to be removed/updated 
        props.onSubmit?.(importMap.tags, importMap.types)
    }

    return (
        <Dialog 
            fullWidth
            maxWidth='md'
            onClose={props.onClose}
            open={props.open}>
            <DialogTitle sx={{margin: view == 'import' ? 0 : undefined}}>Import Tags</DialogTitle>
            <DialogContent sx={{padding: 0}}>
                {view === 'upload' ? (
                    <UploadView 
                        file={file} 
                        onChange={(file) => setFile(file)} />
                ) : (
                   <ImportView 
                        file={file} 
                        types={props.types}
                        tags={props.tags}
                        importMap={importMap} 
                        onChange={(importMap) => {
                            setImportMap(importMap)
                            console.log({importMap})
                        }} />
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Cancel</Button>
                {view == 'upload' ? (
                    <Button onClick={() => setView('import')} disabled={file == null} variant="contained" color="primary">Next</Button>
                ) : (
                    <Button onClick={importFile} variant="contained" color="primary">Import</Button>
                )}
            </DialogActions>
        </Dialog>
    )
}