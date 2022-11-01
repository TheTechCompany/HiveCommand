import { HexHiveTheme } from '@hexhive/styles';
import './App.css';
import { ThemeProvider, Box } from '@mui/material';
import { CommandSurface } from '@hive-command/command-surface';
import { BrowserRouter as Router } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { SetupView } from './views/setup';
import { useEffect, useState } from 'react';

const API_URL = localStorage.getItem('HEXHIVE_API');

const CONF_FILE = 'conf/app.conf.json';



const { readTextFile, writeTextFile, createDir, BaseDirectory } = (window as any).__TAURI__.fs

function App() {
  const [ conf, setConf ] = useState<{
    ready: boolean;
  }>({ready: false})

  useEffect(() => {
    console.log({BaseDirectory: BaseDirectory.App})
    createDir('conf', {dir: BaseDirectory.App, recursive: true}).then(() => {
      writeTextFile({path: CONF_FILE, contents: '{}'}, {dir: BaseDirectory.App}).then(() => {
        console.log("ASFD")
  
        readTextFile(CONF_FILE, {dir: BaseDirectory.App}).then((confText: any) => {
  
          if(confText){
            setConf(JSON.parse(confText))
          }
    
        })
      })
    })
    
  }, []) 

  const renderView = () => {
    if(!conf.ready){
      return (
        <SetupView onConfChange={(conf: any) => setConf(conf)} />
      )
    }else{
        return (
          <CommandSurface />
        ) 
    }
  }

  return (
    <LocalizationProvider 
    dateAdapter={AdapterMoment}>
      <Router>
          <ThemeProvider theme={HexHiveTheme}>
            <Box style={{height: '100vh', width: '100vw', display: 'flex'}}>
              {renderView()}
            </Box>
          </ThemeProvider>
      </Router>
    </LocalizationProvider>
  );
}

export default App;
