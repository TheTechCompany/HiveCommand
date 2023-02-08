import React, { useContext } from 'react'
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

const cmd = Command.sidecar('binaries/sidecar')

function App() {

  const { authState } = useContext(DataContext)

  useEffect(() => {
    cmd.execute().then((proc) => {
      console.log("Sidecar running");

    });
  }, [])
  
  
  useEffect(() => {
    console.log({ BaseDirectory: BaseDirectory.App })
    
    
    // createDir('conf', {dir: BaseDirectory.App, recursive: true}).then(() => {
    //   writeTextFile({path: CONF_FILE, contents: '{}'}, {dir: BaseDirectory.App}).then(() => {
    //     console.log("ASFD")

    //     readTextFile(CONF_FILE, {dir: BaseDirectory.App}).then((confText: any) => {

    //       if(confText){
    //         setConf(JSON.parse(confText))
    //       }

    //     })
    //   })
    // })

  }, [])

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
