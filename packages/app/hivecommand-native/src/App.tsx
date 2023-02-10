import React, { useContext, useState } from 'react'
import { HexHiveTheme } from '@hexhive/styles';
import './App.css';
import { ThemeProvider, Box } from '@mui/material';
import { CommandSurface } from '@hive-command/command-surface';
import { BrowserRouter as Router } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { SetupView } from './views/setup';
import { useEffect } from 'react';
import { DataContext } from './data';
import { BaseDirectory } from '@tauri-apps/api/fs';
import { Controller } from './views/controller';

import { Command } from '@tauri-apps/api/shell';
import axios from 'axios';

const cmd = Command.sidecar('binaries/sidecar')

function App() {

  const { isReady, authState, setAuthState, updateAuthState } = useContext(DataContext)

  const [ sidecarRunning, setSidecarRunning ] = useState(false);

  useEffect(() => {
    cmd.execute().then((proc) => {
      console.log("Sidecar running");

      setSidecarRunning(true);

    });
  }, [])
  

  useEffect(() => {
    if(isReady && sidecarRunning){
      axios.get(`http://localhost:${8484}/setup`).then((data) => {
        if(data.config){
          setAuthState?.({...authState, configProvided: true} )
        }
      })
    }
  }, [isReady, sidecarRunning])

  const renderView = () => {
    if (!authState?.isAuthed()) {
      return (
        <SetupView />
      )
    } else {
      return (
        <Controller />
      )
    }
  }


  return (
    <LocalizationProvider
      dateAdapter={AdapterMoment}>
      <ThemeProvider theme={HexHiveTheme}>
        <Box style={{ height: '100vh', width: '100vw', display: 'flex' }}>

          {renderView()}
        </Box>
      </ThemeProvider>
    </LocalizationProvider>
  );
}

export default App;
