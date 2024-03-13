import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import React, { useEffect, useMemo, useState } from "react";
import { unit as mathUnit } from 'mathjs';
import { HMITag, HMIType } from "@hive-command/interface-types";

export interface DeviceGraphExportModalProps {
    open: boolean;
    onClose?: () => void;

    selected?: any;

    tags: HMITag[], 
    types: HMIType[],
}

export const DeviceGraphExportModal : React.FC<DeviceGraphExportModalProps> = (props) => {

    const [ exportGraph, setExport ] = useState<{
        device?: any,
        key?: any,

        bucket?: string,
        start?: Date | null,
        end?: Date | null
    }>({});

    const timeBucketError = useMemo(() => {
        try{
          if(exportGraph.bucket) return (mathUnit(exportGraph.bucket).to('seconds') == null)
          return false;
        }catch(e){
          console.log({error: e})
          return true;
        }
      }, [exportGraph.bucket])

    useEffect(() => {
        console.log("SEL", props.selected)
        setExport({
            device: props.selected?.tag,
            key: props.selected?.subkey
        })
    }, [props.selected])

    const tagType = useMemo(() => {
        return props.types?.find((a) => a.name == exportGraph?.device?.type)
    }, [exportGraph?.device])

    console.log(props.tags, props.types)

    const hasSubkeys = false;

    return (
        <Dialog fullWidth open={props.open}>
            <DialogTitle>Export data</DialogTitle>
            <DialogContent sx={{display: 'flex'}}> 
                <Box sx={{marginTop: '8px', flex: 1}}>
                    <Autocomplete 
                        options={props.tags}
                        getOptionLabel={(option) => option.name}
                        value={exportGraph?.device}
                        onChange={(ev, value) => {
                            setExport({...exportGraph, device: value})
                        }}
                        renderInput={(params) => <TextField {...params}  size="small" label="Device" />} />

                    {tagType != null ? (
                        <Autocomplete 
                            options={tagType?.fields}
                            getOptionLabel={(option) => option.name}
                            value={exportGraph?.key}
                            onChange={(ev, value) => {
                                setExport({...exportGraph, key: value})
                            }}
                            renderInput={(params) => <TextField {...params} size="small" label="Subkey" />} />
                    ) : null}

                    <Box sx={{marginTop: '8px', display: 'flex'}}>
                        <DatePicker 
                            inputFormat="DD/MM/YYYY"
                            value={exportGraph.start}
                            onChange={(value) => {
                                setExport({...exportGraph, start: value})

                            }} 
                            renderInput={(params) => <TextField {...params} fullWidth size="small" label="Start date" />}/>
                        <DatePicker
                            inputFormat="DD/MM/YYYY"
                            value={exportGraph.end}
                            onChange={(value) => {
                                setExport({...exportGraph, end: value})
                            }}
                            renderInput={(params) => <TextField {...params} fullWidth size="small" label="End date" /> } />
                    </Box>

                    <TextField 
                        error={timeBucketError}
                        value={exportGraph?.bucket}
                        onChange={(e) => setExport({...exportGraph, bucket: e.target.value}) }
                        sx={{marginTop: '8px'}} 
                        fullWidth 
                        size="small" 
                        label="Bucket" />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Close</Button>
                <Button variant="contained" color="primary">Download</Button>
            </DialogActions>
        </Dialog>
    )
}