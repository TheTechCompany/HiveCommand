import { Box, Button, Paper, Step, StepLabel, Stepper, Typography } from "@mui/material";
import { writeTextFile } from "@tauri-apps/api/fs";
import React, { useState } from "react";
import { SetupProvider } from "./context";
import { DiscoveryServerStage, OPCUAServerStage, ProvisionCodeStage } from "./stages";

export const SetupView = (props: any) => {

    const [ state, setState ] = useState<any>({
        discoveryServer: 'discovery.hexhive.io'
    });

    const [ activeIndex, setActiveIndex ] = useState(0);

    const steps = [
        {
            label: "Discovery server"
        },
        {
            label: "Provision code",
            onNext: async (state: any, setState: any) => {
                if(!state.provisionResult){
                    //Test provisionCode against discovery server
                }
            }
        },
        {
            label: "OPCUA Server"
        }
    ]

    const finish = () => {
        // alert(JSON.stringify(state))
        let stateObject = {
            ...state,
            ready: true
        }
        writeTextFile('app.conf.json', JSON.stringify(stateObject))
        props.onConfChange?.(stateObject)
    }

    const goPrevious = () => {
        if(activeIndex > 0){
            setActiveIndex((index) => index - 1)
        }
    }

    const goNext = () => {
        if(activeIndex < steps.length -1){
            setActiveIndex((index) => index + 1)
        }else{
            finish()
        }
    }

    const renderView = () => {
        switch(activeIndex){
            case 0:
                return (
                    <DiscoveryServerStage />
                );
            case 1:
                return (
                    <ProvisionCodeStage />
                )
            case 2:
                return (
                    <OPCUAServerStage />
                )
        }
    }

    return (
        <SetupProvider value={{
            state,
            setState
        }}>
        <Box sx={{flex: 1, display: 'flex', background: '#dfdfdf', alignItems: 'center', justifyContent: 'center'}}>

            <Paper sx={{display: 'flex', flexDirection: 'column', height: '70%', width: '70%'}}>
                <Box sx={{ marginBottom: '3px', padding: '6px', color: 'white', bgcolor: 'secondary.main'}}>
                    <Typography>HiveCommand Setup Wizard</Typography>
                </Box>
                <Stepper activeStep={activeIndex}>
                    {steps.map((step) => (
                        <Step key={step.label}>
                            <StepLabel>{step.label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <Box sx={{flex: 1, display: 'flex'}}>
                    {renderView()}
                </Box>
                <Box sx={{ padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    {activeIndex !== 0 ? (<Button
                        onClick={goPrevious}
                        >Previous</Button>) : <Box />}
                    <Button 
                        onClick={goNext}
                        variant="contained">{activeIndex < steps.length - 1 ? "Next" : "Finish"}</Button>
                </Box>
            </Paper>
            
        </Box>
        </SetupProvider>
    )
}