import React, { useContext, useMemo, useState } from 'react'
import { HexHiveTheme } from '@hexhive/styles';
import './App.css';
import { ThemeProvider, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { SetupView } from './views/setup';
import { useEffect } from 'react';
import { DataContext } from './data';

import { Controller } from './views/controller';

import { Command } from '@tauri-apps/api/shell';
import axios from 'axios';
import { NativeProvider } from './context';
import { listen } from '@tauri-apps/api/event';
import { LoadingView } from './views/loading';

const cmd = Command.sidecar('binaries/sidecar')

function App() {

  const { isReady, authState, setAuthState, updateGlobalState, updateAuthState } = useContext(DataContext)

  const [ sidecarRunning, setSidecarRunning ] = useState(false);

  const [ configured,  setConfigured ] = useState(false);
  
  const [hydrating, setHydrating] = useState(true);

  useEffect(() => {
    //Start Sidecar
    cmd.execute()

    //Setup configuration callback from rust core
    let unlisten: any;

    (async () => {
      unlisten = await listen('configure', () => {
        setAuthState?.('configProvided', false);
      })
    })();
    
    return () => {
      unlisten();
    }
  }, [])

  useEffect(() => {
    const healthcheck = setInterval(() => {
      try{
        fetch(`http://localhost:${8484}/healthcheck`).then((r) => r.json()).then((data) => {
          setSidecarRunning(data.running);
        }).catch((err) => {
          setSidecarRunning(false);
        })
      }catch(err){
        setSidecarRunning(false);
      }
    }, 1 * 1000)

    return () => {
      clearInterval(healthcheck)
    }
  }, [])

  //TODO add different 
  useEffect(() => {
    console.log({isReady, sidecarRunning});

    if(!configured && sidecarRunning){
      console.log("Getting config");

      axios.get(`http://localhost:${8484}/setup`).then((data) => {
        setHydrating(false);

        if(data.data){

          updateGlobalState?.({
            ...data.data
          });

          setAuthState?.('provisionCode', data.data.provisionCode)
          setAuthState?.('authToken', data.data.authToken)

          setAuthState?.('configProvided', true)
          setConfigured(true)
        }
      })
    }
  }, [authState, isReady, configured, sidecarRunning])

  console.log({isAuthed: authState?.isAuthed(), authState})


  const renderView = () => {
    if(hydrating){
      return (<LoadingView />)
    }else{
      if (!authState?.isAuthed()) {
        return (
          <SetupView />
        )
      } else {
        return (
          <Controller sidecar={sidecarRunning} />
        )
      }
    }
  }


  return (
    <NativeProvider value={{isSidecarRunning: sidecarRunning}}>
      <LocalizationProvider
        dateAdapter={AdapterMoment}>
        <ThemeProvider theme={HexHiveTheme}>
          <Box style={{ height: '100vh', width: '100vw', display: 'flex' }}>

            {renderView()}
          </Box>
        </ThemeProvider>
      </LocalizationProvider>
    </NativeProvider>
  );
}

export default App;
