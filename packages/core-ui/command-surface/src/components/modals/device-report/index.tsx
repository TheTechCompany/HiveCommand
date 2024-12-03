import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import React, { useEffect, useMemo, useState } from 'react';
import { unit as mathUnit } from 'mathjs';

export interface DeviceReport {
    id?: string,

    name?: string,
    recurring?: boolean,
    startDate?: Date | null,
    endDate?: Date | null,
    reportLength?: string,
}

export interface DeviceReportModalProps {
    open: boolean;
    selected?: any;

    onDelete?: () => void;
    onClose?: () => void;
    onSubmit?: (report: DeviceReport) => void;
}

export const DeviceReportModal : React.FC<DeviceReportModalProps> = (props) => {
    
    const [ report, setReport ] = useState<DeviceReport>({})

    const timeBucketError = useMemo(() => {
        try{
            if(report.recurring && !report.reportLength) return true;
            if(report.reportLength) return (mathUnit(report.reportLength).to('seconds') == null || mathUnit(report.reportLength).to('seconds').toNumber() == 0)
            return false;
        }catch(e){
          console.log({error: e})
          return true;
        }
      }, [report.reportLength])

    useEffect(() => {
        setReport({...props.selected})
    }, [props.selected])
      
    return (
        <Dialog 
            fullWidth
            open={props.open} 
            onClose={props.onClose}>
            <DialogTitle>
                {props.selected ? "Update" : "Create"} Report
            </DialogTitle>
            <DialogContent>
                <Box sx={{marginTop: '8px', display: 'flex', flexDirection: 'column'}}>
                    <TextField 
                        fullWidth
                        value={report.name}
                        onChange={(e) => {
                            setReport({...report, name: e.target.value})
                        }}
                        size="small" 
                        label="Name" />

                    <FormControlLabel 
                        control={
                            <Checkbox checked={report.recurring} onChange={(e) => {
                                setReport({...report, recurring: e.target.checked})
                                if(e.target.checked){
                                    setReport({...report, endDate: null})
                                }else{
                                    setReport({...report, endDate: new Date()})
                                }
                            }} />
                        } 
                        label="Recurring" />

                    <DatePicker 
                        inputFormat='DD/MM/YYYY'
                        renderInput={(params) => <TextField {...params} fullWidth size="small" label="Start Date" />}
                        value={report.startDate}
                        onChange={(value) => {
                            setReport({...report, startDate: value})
                        }} />

                    <Box sx={{marginTop: '8px'}}>
                    {report.recurring ? 
                        (<TextField
                            error={timeBucketError}
                            value={report.reportLength}
                            onChange={(e) => setReport({
                                ...report,
                                reportLength: e.target.value
                            })}
                            fullWidth
                            size="small" 
                            label="Report length" />) : 
                        <DatePicker 
                            inputFormat='DD/MM/YYYY'
                            renderInput={(params) => <TextField {...params} fullWidth size="small" label="End Date" />}
                            value={report.endDate}
                            onChange={(value) => {
                                setReport({...report, endDate: value})
                            }}
                            />}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{display: 'flex', justifyContent: props.selected ? "space-between" : 'flex-end'}}>
                {props.selected ? (<Button onClick={props.onDelete} color="error" variant="contained">Delete</Button>) : null}
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <Button onClick={props.onClose}>Close</Button>
                    <Button onClick={() => {
                        if(!timeBucketError) props.onSubmit?.(report)
                    }} variant="contained" color="primary">{props.selected ? "Save": "Create"}</Button>
                </Box>
            </DialogActions>
        </Dialog>
    )
}