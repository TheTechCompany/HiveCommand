import React, { useState } from 'react';
import { ImportView } from './import';
import { UploadView } from './upload';
import {Dialog, DialogTitle, DialogContent, DialogActions, Button} from '@mui/material';
import { useMutation, gql } from '@apollo/client'

export interface ImportModalProps {
    open: boolean;
    onSubmit?: (
        tags: {name: string, type: string}[],
        types: {name: string, fields: {name: string, type: string}[]}[]
    ) => void;
    onClose?: () => void;
}

export const ImportModal : React.FC<ImportModalProps> = (props) => {

    const [ view, setView ] = useState<'import' | 'upload'>('upload');

    const [ file, setFile ] = useState<any | null>(null)

    const [ importMap, setImportMap ] = useState<{
        tags: {name: string, type: string}[],
        types: { name: string, fields: {name: string, type: string}[] }[]
    }>({
        tags: [],
        types: []
    })

    const importFile = () => {
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
                    <UploadView file={file} onChange={(file) => setFile(file)} />
                ) : (
                   <ImportView 
                        file={file} 
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