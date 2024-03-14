import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import React, { useMemo, useState } from 'react';
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
    onClose?: () => void;
    onSubmit?: (report: DeviceReport) => void;
}

export const DeviceReportModal : React.FC<DeviceReportModalProps> = (props) => {
    
    const [ report, setReport ] = useState<DeviceReport>({})

    const timeBucketError = useMemo(() => {
        try{
          if(report.reportLength) return (mathUnit(report.reportLength).to('seconds') == null)
          return false;
        }catch(e){
          console.log({error: e})
          return true;
        }
      }, [report.reportLength])
      
    return (
        <Dialog 
            fullWidth
            open={props.open} 
            onClose={props.onClose}>
            <DialogTitle>
                Create Report
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
                            <Checkbox checked={report.recurring} onChange={(e) => setReport({...report, recurring: e.target.checked})} />
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
            <DialogActions>
                <Button onClick={props.onClose}>Close</Button>
                <Button onClick={() => props.onSubmit?.(report)} variant="contained" color="primary">Save</Button>
            </DialogActions>
        </Dialog>
    )
}