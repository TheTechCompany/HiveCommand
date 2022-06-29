import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Grommet } from "grommet";
import Dashboard from "./views/Dashboard";
import { BaseStyle } from "@hexhive/styles";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { AuthProvider } from '@hexhive/auth-ui'
import { ThemeProvider,Box, createTheme } from '@mui/material'
import { DeviceControl } from "./pages/device-control";

const API_URL = localStorage.getItem('HEXHIVE_API');

const authServer = process.env.REACT_APP_API
  ? `${process.env.REACT_APP_API}`
  : "http://localhost:7000";

const client = new ApolloClient({
  uri: `${process.env.NODE_ENV == 'production'
    ? `${API_URL || process.env.REACT_APP_API}/graphql`
    : "http://localhost:7000/graphql"}`,
  cache: new InMemoryCache(),
  credentials: "include",
});

const globalTheme = createTheme({
  palette: {
    primary: {
      light: '#fff8f2',
      main: '#72738b'
    },
    secondary: {
      // light: '#a3b579',
      main: "#87927e"
    },
    navigation: {
      main: '#e3d1c7'
    }
  }
})
const theme = createTheme({
  palette: {
    ...globalTheme.palette
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          background: globalTheme.palette.primary.light,
          borderRadius: '6px',
          overflow: "hidden"
        }
      }
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          background: globalTheme.palette.secondary.main
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: '36px',
        },
        indicator: {
          background: globalTheme.palette.navigation.main
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          padding: '6px',
          color: globalTheme.palette.navigation.main,
          minHeight: '36px',
         
          '&.Mui-selected': {
            color: globalTheme.palette.navigation.main
            
          }
        }
      
      }
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '6px'
        }
      }
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '6px',
          paddingTop: '6px'
        }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          background: globalTheme.palette.secondary.main,
          color: '#fff',
          padding: '6px',
          fontSize: '16px',
          marginBottom: '6px'
        }
      }
    }
  }
  // palette: {
  //   // primary: {
  //   //   main: '',
  //   // },
  //   // secondary: {
  //   //   main: ''
  //   // }
  // }
});

function App(props: any) {

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider authorizationServer={authServer}>
        <Grommet
          style={{ display: "flex", flex: 1, height: "100%", width: "100%" }}
          full
          theme={BaseStyle}
          plain
        >
          <ApolloProvider client={client}>
            <Router basename={process.env.PUBLIC_URL || "/dashboard/command"}>
              <Box sx={{  flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'primary.dark'}}>
            <Routes>
              <Route path={`devices/:id/*`} element={<DeviceControl/>} />
            
              <Route path={'*'} element={<Dashboard />} />
              </Routes>
              </Box>
            </Router>
          </ApolloProvider>
        </Grommet>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
