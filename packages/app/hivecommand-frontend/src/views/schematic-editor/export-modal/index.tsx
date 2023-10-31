import { gql, useMutation } from '@apollo/client';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export interface ExportModalProps {
    open: boolean;
    onClose?: () => void;
    onDownload?: (version: string) => void;

    versions: { id: string, rank: number, createdAt: Date, createdBy: any }[]
}

export const ExportModal : React.FC<ExportModalProps> = (props) => {

    const { id } = useParams();

    const [ activeVersion, setActiveVersion ] = useState<any>(null);

    const selectedVersion = props.versions?.find((a) => a.id == (activeVersion) );

    const [ createRevision ] = useMutation(gql`
        mutation CreateRevision ($id: ID!, $commit: String){
            createCommandSchematicVersion(id: $id, input: {commit: $commit})
        }
    `, {
        refetchQueries: ['GetSchematic']
    })

    useEffect(() => {
        const defaultVersion = props.versions?.slice()?.sort((a, b) => a.rank - b.rank)?.[props.versions?.length - 1]?.id;
        setActiveVersion(defaultVersion)
    }, [props.versions])

    return (
        <Dialog 
            fullWidth
            onClose={props.onClose}
            open={props.open}>
            <DialogTitle>
                Export 
            </DialogTitle>
            <DialogContent sx={{display: 'flex'}}>
                <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', marginTop: '6px'}}>
                    <FormControl size="small" fullWidth>
                        <InputLabel>Version</InputLabel>
                        <Select 
                            onChange={(e) => {
                                if(e.target.value == 'new'){
                                    //Create
                                    createRevision({
                                        variables: {
                                            id,
                                            commit: 'Routine version update'
                                        }
                                    }).then((data) => {
                                        console.log(data?.data?.createCommandSchematicVersion)
                                    })
                                    //Set to newly craeted
                                }else{
                                    setActiveVersion(e.target.value)
                                }
                            }}
                            value={activeVersion}
                            label="Version">
                            {props.versions?.map((v) => (
                                <MenuItem value={v.id}>v{v.rank}</MenuItem>
                            ))}
                            <MenuItem value={'new'}>New version</MenuItem>
                        </Select>
                    </FormControl>
                    {selectedVersion ? (
                        <>
                            <Typography>Last updated: {moment(selectedVersion?.createdAt).format('hh:mma - DD/MM/YY')} </Typography>
                            <Typography>Last updated by: {selectedVersion?.createdBy?.name}</Typography>
                        </>
                    ) : null}
                   
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Cancel</Button>
                <Button onClick={() => props.onDownload?.(activeVersion)} color="primary" variant="contained">Download PDF</Button>
            </DialogActions>
        </Dialog>
    )
}


//{props.exporting ? <CircularProgress size={'20px'} sx={{ marginRight: '6px' }} /> : null} Export
