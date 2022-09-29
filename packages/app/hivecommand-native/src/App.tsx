import React, { useEffect, useMemo, useState } from 'react';
import logo from './logo.svg';
import { InfiniteCanvas } from '@hexhive/ui';
import { HexHiveTheme } from '@hexhive/styles';
import './App.css';
import { ThemeProvider, Box } from '@mui/material';
import { readTextFile, writeTextFile } from '@tauri-apps/api/fs'
import { SetupView } from './views/setup';
import { CommandSurface } from '@hive-command/command-surface';

const CONF_FILE = 'app.conf.json';

function App() {

  const [ conf, setConf ] = useState<{
    ready: boolean;
  }>({ready: false})

  useEffect(() => {
    readTextFile(CONF_FILE).then((confText) => {

      if(confText){
        setConf(JSON.parse(confText))
      }

    })
  }, []) 

  const renderView = () => {
    if(!conf.ready){
      return (
        <SetupView onConfChange={(conf: any) => setConf(conf)} />
      )
    }else{
        return (
          <InfiniteCanvas />
        ) 
    }
  }

  return (
    <ThemeProvider theme={HexHiveTheme}>
      <Box style={{height: '100vh', width: '100vw', display: 'flex'}}>
        <CommandSurface />
      </Box>
    </ThemeProvider>
  );
}

export default App;
