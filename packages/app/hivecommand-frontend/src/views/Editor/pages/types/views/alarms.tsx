import { Autocomplete, Box, Button, Collapse, Divider, Paper, TextField } from '@mui/material';
import React from 'react';

export const Alarms = () => {
    return (
        <Box sx={{flexDirection: 'column', display: 'flex'}}>
            <Paper>
                <Box sx={{padding: '6px'}}>
                    <TextField 
                        fullWidth
                        size="small" 
                        variant='standard' 
                        label="Alarm name" />
                </Box>
                <Divider />
                <Collapse in={true}>
                {["", ""].map((condition) => (
                    <Box sx={{display: 'flex', marginBottom: '6px', marginTop: '6px'}}>
                        <TextField fullWidth size='small' label="Field" />
                        <Autocomplete
                            sx={{minWidth: '100px'}}
                            options={[
                                "is not equal",
                                "equals",
                                "greater than",
                                "greater than or equal to",
                                "less than",
                                "less than or equal to",
                                "!=",
                                "==",
                                ">",
                                ">=",
                                "<",
                                "<="
                            ]}
                            renderInput={(params) => <TextField {...params}  size="small"/>}
                            />
                        <TextField fullWidth size="small" label="Value" />
                    </Box>
                ))}
                <Button>Add field</Button>
                </Collapse>
            </Paper>
            <Button>Add Alarm</Button>
        </Box>
    )
}