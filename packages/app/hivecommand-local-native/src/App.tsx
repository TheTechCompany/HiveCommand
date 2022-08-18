import React from 'react';
import logo from './logo.svg';
import { InfiniteCanvas } from '@hexhive/ui';
import { HexHiveTheme } from '@hexhive/styles';
import './App.css';
import { ThemeProvider, Box } from '@mui/material';

function App() {
  return (
    <ThemeProvider theme={HexHiveTheme}>
      <Box style={{height: '100vh', width: '100vw', display: 'flex'}}>
        <InfiniteCanvas />
      </Box>
    </ThemeProvider>
  );
}

export default App;
