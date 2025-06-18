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
    
    const [ report, setReport ] = useState<DeviceReport>({
        recurring: false
    })

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
        setReport({...props.selected, recurring: props.selected?.recurring || false})
    }, [props.selected])
      
    console.log("REC", {recurring: report.recurring})

    return (
        <Dialog 
            fullWidth
            open={props.open} 
            onClose={props.onClose}>
            <DialogTitle>
                {props.selected?.id ? "Update" : "Create"} Report
            </DialogTitle>
            <DialogContent>
                <Box sx={{marginTop: '8px', display: 'flex', flexDirection: 'column'}}>
                    <TextField 
                        fullWidth
                        value={report.name || ''}
                        onChange={(e) => {
                            setReport({...report, name: e.target.value})
                        }}
                        size="small" 
                        label="Name" />

                    <FormControlLabel 
                        control={
                            <Checkbox checked={report.recurring || false} onChange={(e) => {
                                setReport((r) => ({...r, recurring: e.target.checked}))
                                if(e.target.checked){
                                    setReport((r) => ({...r, endDate: null}))
                                }else{
                                    setReport((r) => ({...r, endDate: new Date()}))
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
                            key={'report-length'}
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
                            key={'report-end'}

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
            <DialogActions sx={{display: 'flex', justifyContent: props.selected?.id ? "space-between" : 'flex-end'}}>
                {props.selected?.id ? (<Button onClick={props.onDelete} color="error" variant="contained">Delete</Button>) : null}
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <Button onClick={props.onClose}>Close</Button>
                    <Button onClick={() => {
                        if(!timeBucketError) props.onSubmit?.(report)
                    }} variant="contained" color="primary">{props.selected?.id ? "Save": "Create"}</Button>
                </Box>
            </DialogActions>
        </Dialog>
    )
}