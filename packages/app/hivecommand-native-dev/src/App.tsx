import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { Box, Divider, IconButton, ListItem, Paper, Typography } from '@mui/material'
import { Menu } from '@mui/icons-material'
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import { AppBar } from "@mui/material";
import { Toolbar } from "@mui/material";
import { Drawer } from "@mui/material";
import { List } from "@mui/material";
import { Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { OPCUAList } from "./views/opcua-list";
import { HMIList } from "./views/hmi-list";
import { DevProvider } from "./context";
import { getSettingsBlob, updateSettingsKey } from "./utils";
import { HMIView } from "./views/hmi-view";
import { OPCUAView } from "./views/opcua-view";
import {nanoid} from 'nanoid'
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

import { Command } from '@tauri-apps/api/shell';

const cmd = Command.sidecar('binaries/sidecar')

// import {readTextFile} from '@tauri-apps/api/fs';
// const API_URL = localStorage.getItem('HEXHIVE_API');


// // const URL = `${process.env.NODE_ENV === 'production'
// //     ? `${API_URL || process.env.REACT_APP_API}/graphql`
// //     : "http://localhost:7000/graphql"}`;
    

// // const client = new ApolloClient({
// //   uri: URL,
// //   // ink: splitLink,
// //   cache: new InMemoryCache(),
// //   credentials: "include",
// // });

function App() {

  const drawerWidth = 240;

  const drawerMenu = [
    {
      id: 'opcua-sources',
      label: 'OPCUA Sources',
      component_children: [
        <Route path="" element={<OPCUAList />} />,
        <Route path=":id" element={<OPCUAView />} /> 
      ],
      component: (<Outlet />)
    },
    {
      id: 'hmi-list',
      label: 'HMI List',
      component_children: [
        <Route path="" element={<HMIList />} />,
        <Route path=":id" element={<HMIView />} />
      ],
      component: (
        <Outlet />
      )
    }
  ]

  const [ hmiList, setHMIList ] = useState<any[]>([]);
  const [ opcuaList, setOPCUAList ] = useState<any[]>([]);

  const [ drawerOpen, setDrawerOpen ] = useState(false);

  const navigate = useNavigate();



  useEffect(() => {
    cmd.execute();
  }, [])
  // cmd.execute();
  

  useEffect(() => {
    getSettingsBlob().then((blob) => {
      setHMIList(blob.hmi || []);
      setOPCUAList(blob.opcua || []);
    })
  }, [])

  return (
      <DevProvider value={{
        hmiList,
        opcuaList,
        createHMI(name, opts) {

          
          setHMIList((hmi) => {
            hmi.push({id: nanoid(), name, file: opts.filePath});
            return hmi;
          })
          
          // updateSettingsKey('hmi', (value = []) => {
          //   let newValue : any[] = value.slice();
          //   newValue.push({name, file: opts.filePath}) 
          // })
        },
        createOPCUASource(name, opts) {
          setOPCUAList((opcua) => {
            opcua.push({id: nanoid(), name, host: opts.host, port: opts.port})
            return opcua;
          })
          // updateSettingsKey('opcua', (value = []) => {
          //   let newValue : any[] = value.slice();
          //   newValue.push({name, host: opts.host, port: opts.port});
          // })
        },
      }}>
        <Box sx={{flex: 1, height: '100vh', display: 'flex', flexDirection: 'column'}}>
          <Box sx={{bgcolor: 'primary.main', padding: '3px', display: 'flex', alignItems: 'center'}}>
              <IconButton
                onClick={() => setDrawerOpen(true)}
                sx={{color: 'navigation.main'}}>
                <Menu  />
              </IconButton>
              <Typography sx={{color: 'navigation.main', marginLeft: '6px'}}>HiveCommand</Typography>
          </Box>
          <Paper sx={{flex: 1, borderRadius: 0, display: 'flex'}}>
            <Drawer
              onClose={() => {
                setDrawerOpen(false);
              }} 
              sx={{
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
              }}
              open={drawerOpen}>
              <Box sx={{display: 'flex', justifyContent: 'center', padding: '3px'}}>
                <Typography>HiveCommand Dev</Typography>
              </Box>
              <Divider />
              <List>
                {drawerMenu.map((menu_item) => (
                  <ListItem button onClick={() => {
                    navigate(menu_item.id);
                    setDrawerOpen(false);
                  }}>
                    {menu_item.label}
                  </ListItem>
                ))}
              </List>

            </Drawer>

            <Routes>
              <Route path="" element={<div>homepage</div>} />
              {drawerMenu.map((menu_item) => (
                <Route path={menu_item.id} element={menu_item.component}>
                  {menu_item.component_children}
                </Route>
              ))}
            </Routes>
          </Paper>

        </Box>
      </DevProvider>
  );
}

export default App;
