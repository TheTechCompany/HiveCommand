import {DialogContent, Box, Dialog, DialogTitle, Button, DialogActions, Typography, Table, TableHead, TableBody, TableRow, TableCell, Checkbox, Tabs, Tab} from '@mui/material';
import React, { useCallback, useState } from 'react';
import {useDropzone} from 'react-dropzone'
import Papa from 'papaparse'
import {Document} from '@allenbradley/l5x'
import { gql, useMutation } from '@apollo/client';

export const ExportModal = (props: any) => {

    return (
        <Dialog 
            onClose={props.onClose}
            open={props.open}>
            <DialogTitle>Export Tags</DialogTitle>
            <DialogContent>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Cancel</Button>
                <Button variant="contained" color="primary">Export</Button>

            </DialogActions>
        </Dialog>
    )
}
