import { Box, Button, Paper, Step, StepLabel, Stepper, Typography } from "@mui/material";
import { writeTextFile } from "@tauri-apps/api/fs";
import React, { useContext, useState } from "react";
import { SetupProvider } from "./context";
import { DiscoveryServerStage, LayoutDownload } from "./stages";
import axios from 'axios';
import { DataContext } from "../../data";
import { LocalPersistenceStage } from "./stages/localPersistence";

export const SetupView = (props: any) => {

    const { authState, updateAuthState, setAuthState, globalState, updateGlobalState } = useContext(DataContext);

    const [activeIndex, setActiveIndex] = useState(0);

    const steps = [
        {
            label: "Persistence",
        },
        {
            label: "Discovery server",
            onNext: async (state: any, setState: any) => {
                // if (!state.authToken) {
                //Test provisionCode against discovery server

                const res = await axios.post(`${state.discoveryServer}/authorize`, {
                    shortCode: state.provisionCode
                });

                if (res?.data?.token) {
                    setState('authToken', res.data.token)
                    console.log({ token: res.data.token })

                    return true;
                } else {
                    console.log({ res })
                }
                // } else {
                //     return true;
                // }
            }
        },
        {
            label: "Downloading assets",
            onNext: async () => {
                const data = await axios.post(`http://localhost:${8484}/setup`, {
                    config: {
                        interface: globalState?.interface,
                        tags: globalState?.tags,
                        types: globalState?.types,
                        components: globalState?.components,
                        dataScopes: globalState?.dataScopes,
                        templatePacks: globalState?.templatePacks,
                        provisionCode: authState?.provisionCode,
                        authToken: authState?.authToken,
                        iot: {
                            host: globalState?.iotEndpoint,
                            user: globalState?.iotUser,
                            pass: globalState?.iotToken,
                            exchange: globalState?.iotSubject
                        }
                    }
                })

                setAuthState?.('configProvided', true)
            }
        }
        // {
        //     label: "Subscription items",
        //     onNext: async (state: any, setState: any) => {

        //         console.log({ networkLayout: globalState?.networkLayout })
        //         try {


        //             setState('opcuaProvisioned', true)
        //             return true;
        //         } catch (err) {
        //             console.error("configProvided failed", err);
        //             return true;

        //         }

        //     }
        // },
        // {
        //     label: "Data mapping",
        //     onNext: async () => {
        //         try{
        //             const data = await axios.post(`http://localhost:${8484}/setup`, {
        //                 config: {
        //                     tags: globalState?.controlLayout?.tags,
        //                     types: globalState?.controlLayout?.types,
        //                     opcuaServer: authState?.opcuaServer,
        //                     iot: {
        //                         host: globalState?.networkLayout?.iotEndpoint,
        //                         user: globalState?.networkLayout?.iotUser,
        //                         pass: globalState?.networkLayout?.iotToken,
        //                         exchange: globalState?.networkLayout?.iotSubject
        //                     },
        //                     subscriptionMap: globalState?.subscriptionMap,
        //                     deviceMap: globalState?.deviceMap
        //                 }
        //             })

        //             setAuthState?.('configProvided', true)

        //         }catch(e){

        //         }
        //         // setAuthState?.('configProvided', true)

        //     }
        // }
    ]

    const finish = () => {
        // alert(JSON.stringify(state))
        let stateObject = {
            ...authState,
            ready: true
        }

        console.log("FINISH", { stateObject })

        // writeTextFile('app.conf.json', JSON.stringify(stateObject))
        props.onConfChange?.(stateObject)
    }

    const goPrevious = () => {
        if (activeIndex > 0) {
            setActiveIndex((index) => index - 1)
        }
    }

    const goNext = async () => {
        const res = await steps[activeIndex].onNext?.(authState, updateAuthState)
        if (res || !steps[activeIndex].onNext) {
            if (activeIndex < steps.length - 1) {
                setActiveIndex((index) => index + 1)
            } else {
                finish()
            }
        }

    }

    const renderView = () => {
        switch (activeIndex) {
            case 0:
                return (
                    <LocalPersistenceStage />
                )
            case 1:
                return (
                    <DiscoveryServerStage />
                );
            case 2:
                return (
                    <LayoutDownload />
                )

        }
    }

    return (
        <SetupProvider value={{
            state: authState,
            setState: updateAuthState,
            globalState,
            setGlobalState: updateGlobalState
        }}>
            <Box sx={{ flex: 1, display: 'flex', background: '#dfdfdf', alignItems: 'center', justifyContent: 'center' }}>

                <Paper sx={{ display: 'flex', flexDirection: 'column', height: '70%', width: '70%' }}>
                    <Box sx={{ marginBottom: '6px', padding: '6px', color: 'white', bgcolor: 'secondary.main' }}>
                        <Typography>HiveCommand Setup Wizard</Typography>
                    </Box>
                    <Stepper activeStep={activeIndex}>
                        {steps.map((step) => (
                            <Step key={step.label}>
                                <StepLabel>{step.label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    <Box sx={{ flex: 1, display: 'flex' }}>
                        {renderView()}
                    </Box>
                    <Box sx={{ padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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