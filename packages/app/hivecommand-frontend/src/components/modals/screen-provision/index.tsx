import { Box, Button, DialogTitle } from '@mui/material';
import { DialogActions } from '@mui/material';
import { Typography } from '@mui/material';
import { FormControlLabel } from '@mui/material';
import { Checkbox } from '@mui/material';
import { TextField } from '@mui/material';
import { DialogContent } from '@mui/material';
import { Dialog } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { useCreateDeviceScreen } from '@hive-command/api';

export const ScreenProvisionModal = (props) => {


    const createDeviceScreen = useCreateDeviceScreen(props.device);

    const [activeStep, setActiveStep] = useState<number>(0);

    const [ screenData, setScreenData ] = useState<any>({});

    const updateScreenData = (key: string, value: any) => {
        setScreenData({
            ...screenData,
            [key]: value
        })
    }


    useEffect(() => {
        setScreenData({})
        setActiveStep(0)
    }, [props.open]);

    useEffect(() => {
        setScreenData({
            ...props.selected
        })
        setActiveStep(0)
    }, [props.selected])

    const steps = [
        {id: 'screen-name', label: "Next", view: (
            <>
            <TextField 
                value={screenData.name}
                onKeyDown={(e) => e.key == 'Enter' && nextStep()}
                onChange={(e) => updateScreenData('name', e.target.value)}
                size="small"  
                fullWidth 
                label="Token name" />

            <FormControlLabel 
                sx={{marginTop: '6px'}}
                label="Development token"
                control={
                    <Checkbox />
                } />
            </>
            
        ), beforeNext: async () => {
            if(screenData.id){

            }else{
                const {item} = await createDeviceScreen(screenData.name);

                setScreenData({...screenData, provisionCode: item.provisionCode, id: item.id});
            }
        }},
        {id: 'provisioning', label: "Provision", view: (
            <Box>
                <TextField size="small" label="Token" value={screenData.provisionCode} disabled fullWidth />
                {/* <Typography>Provisioning...</Typography> */}
            </Box>
        ), beforeNext: async () => {
            //Set loading

            //Call service every x seconds to check for provisioning statements

            //Nextify
        }},
        {id: 'finished', label: "Finish", view: (
            <Box>
                <Typography>Token created successfully</Typography>
            </Box>
        )}
    ]
    
    const previousStep = () => {
        let prev = activeStep - 1;
        if(prev < 0){
            //Exit
            props.onClose?.()
        }else{
            setActiveStep(prev)
        }
    }

    const nextStep = () => {
        let next = activeStep + 1;
        if(next > steps.length - 1){
            //Finish
            props.onSubmit?.()
        }else{
            (steps?.[activeStep].beforeNext?.() || new Promise((resolve) => resolve())).then(() => {
                setActiveStep(next)
            })
        }
    }

    const renderStep = () => {
        return steps?.[activeStep]?.view
    };
    
    return (
        <Dialog 
            fullWidth
            open={props.open}
            onClose={props.onClose}>
            <DialogTitle>
                Create token
            </DialogTitle>
            <DialogContent >
                <Box sx={{padding: '6px'}}>
                    {renderStep()}
                </Box>
            </DialogContent>
            <DialogActions sx={{justifyContent: screenData.id ? 'space-between' : 'flex-end'}}>
                {screenData.id && <Button color="error">Delete</Button>}

                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <Button onClick={previousStep}>{activeStep == 0 ? "Cancel" : "Back"}</Button>
                    <Button 
                        color="primary" 
                        onClick={nextStep}
                        variant="contained">{steps[activeStep].label}</Button>
                </Box>
            </DialogActions>
        </Dialog>
    )
}