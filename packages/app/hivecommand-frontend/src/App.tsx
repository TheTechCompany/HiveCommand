import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Grommet } from "grommet";
import Dashboard from "./views/Dashboard";
import { HexHiveTheme } from "@hexhive/styles";
import { ApolloClient, ApolloProvider, fallbackHttpConfig, InMemoryCache, selectHttpOptionsAndBody, serializeFetchParameter, split } from "@apollo/client";
import { AuthProvider } from '@hexhive/auth-ui'
import { ThemeProvider,Box, createTheme } from '@mui/material'
import { DeviceControl } from "./pages/device-control";
import { EditorPage } from "./views/Editor";
import { HttpLink } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { ApolloLink } from "@apollo/client";
import { Observable } from "@apollo/client/utilities";
const API_URL = localStorage.getItem('HEXHIVE_API');

const authServer = process.env.REACT_APP_API
  ? `${process.env.REACT_APP_API}`
  : "http://localhost:7000";

  const URL = `${process.env.NODE_ENV == 'production'
    ? `${API_URL || process.env.REACT_APP_API}/graphql`
    : "http://localhost:7000/graphql"}`;
    
  const splitLink = split(

    ({ query }) => {
  
      const definition = getMainDefinition(query);
  
      return (
  
        definition.kind === 'OperationDefinition' &&
  
        definition.operation === 'subscription'
  
      );
  
    },
    //Subscriptions
    new ApolloLink((operation) => {

      let uri = URL;

      const linkConfig = {
        options: {},
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
      };

      return new Observable((observer) => {
        const context = operation.getContext();

        const contextHeaders = context.headers;
        const contextConfig = {
          http: context.http,
          options: context.fetchOptions,
          credentials: context.credentials,
          headers: contextHeaders,
        };
        
           //uses fallback, link, and then context to build options
        const { options, body } = selectHttpOptionsAndBody(
          operation,
          fallbackHttpConfig,
          linkConfig,
          contextConfig,
        );

        console.log({options});

        fetch(uri, {
          method: "POST",
          credentials: 'include', 
          headers: {'Content-Type': 'application/json'},
          ...options,
          body: serializeFetchParameter(body, 'Payload')
        }).then((r) => {
          return r.body
        }).then(async (body) => {
          let reader = body.getReader()

          let done, value;
          while(!done){
            ({done, value} = await reader.read());

            let strValue = new TextDecoder().decode(value)
            console.log({strValue})
            let parsed = strValue.toString()?.match(/data: (.+)/)?.[1];

            console.log({parsed})
            observer.next(JSON.parse(parsed));
          }
        })

      })

      // uri: URL,
      // fetch: async (url, options) => {

      //   const result = await fetch(url, {
      //     ...options,
      //     credentials: 'include'
      //   });

      //   const reader = result.body.getReader();

      //   let done, value;

      //   while(!done){
      //       ({value, done} = await reader.read());
                  
      //       console.log( new TextDecoder().decode(value) );
      //   }

      //   console.log({result})
      //   return result;
      
    }),
    //Base
    new HttpLink({
      uri: URL,
      credentials: 'include'
    }),
  );
const client = new ApolloClient({
  link: splitLink,
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
    <ThemeProvider theme={HexHiveTheme}>
      <AuthProvider authorizationServer={authServer}>
       
          <ApolloProvider client={client}>
            <Router basename={process.env.PUBLIC_URL || "/dashboard/command"}>
            <Box sx={{ height: '100%', color: 'white', flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'primary.dark'}}>
            <Routes>
              <Route path={`devices/:id/*`} element={<DeviceControl/>} />

              <Route path={`programs/:id/*`} element={<EditorPage />} />
              <Route path={'*'} element={<Dashboard />} />
              </Routes>
              </Box>
            </Router>
          </ApolloProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
