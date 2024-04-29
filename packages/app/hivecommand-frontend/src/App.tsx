import React, { lazy } from "react";
import { BrowserRouter as Router, Route, Outlet, useLocation, useNavigate, Routes } from "react-router-dom";
import Dashboard from "./views/Dashboard";
import { HexHiveTheme } from "@hexhive/styles";
import { ApolloClient, ApolloProvider, fallbackHttpConfig, InMemoryCache, selectHttpOptionsAndBody, serializeFetchParameter, split } from "@apollo/client";
import { AuthProvider } from '@hexhive/auth-ui'
import { ThemeProvider, Box, createTheme, CircularProgress } from '@mui/material'
import { HttpLink } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { ApolloLink } from "@apollo/client";
import { Observable } from "@apollo/client/utilities";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
// import { DeviceControlView } from "./pages/device-control";
import { pages } from './views/Dashboard'
import { Sidebar } from './components/sidebar'
import { DeviceSettings } from './pages/device-settings';

const SchematicEditor = lazy(() => import('./views/schematic-editor').then((r) => ({ default: r.SchematicEditor })))
const FunctionEditor = lazy(() => import('./views/function-editor').then((r) => ({ default: r.FunctionEditor })))
const DeviceControlView = lazy(() => import('./pages/device-control').then((r) => ({ default: r.DeviceControlView })))
const EditorPage = lazy(() => import('./views/Editor').then((r) => ({ default: r.EditorPage })))

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

      fetch(uri, {
        method: "POST",
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        ...options,
        body: serializeFetchParameter(body, 'Payload')
      }).then((r) => {
        return r.body
      }).then(async (body) => {
        let reader = body?.getReader()

        let done, value;
        while (!done) {
          ({ done, value } = await reader?.read() || {});

          let strValue = new TextDecoder().decode(value)

          let parsed = strValue.toString()?.match(/data: (.+)/)?.[1];

          if (parsed)
            observer.next(JSON.parse(parsed));
        }
      })

    })

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


function App(props: any) {
  const navigate = useNavigate()

  const path = useLocation()

  return (
    <LocalizationProvider
      dateAdapter={AdapterMoment}>

      <React.Suspense fallback={(
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress color="primary" size="medium" />
        </Box>)}>
        <ThemeProvider theme={HexHiveTheme}>
          <AuthProvider authorizationServer={authServer}>
            <ApolloProvider client={client}>
              <Box sx={{ height: '100%', color: 'white', flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'primary.dark' }}>
                <Routes>
                  <Route path={`programs/:id/*`} element={<EditorPage />} />
                  <Route path={`schematics/:id/*`} element={<SchematicEditor />} />
                  <Route path={`functions/:id/*`} element={<FunctionEditor />} />
                  <Route path={`deployments/:id/*`} element={<DeviceControlView />}>
                  </Route>
                  <Route element={(
                    <Box sx={{ display: 'flex', flex: 1 }}>
                      <Sidebar
                        active={path.pathname}
                        // active={path.pathname?.slice(1, path.pathname?.length) || window.location.pathname.replace((process.env.REACT_APP_URL || '/dashboard/command'), '')}
                        onSelect={(item) => {
                          navigate(item.path)
                        }}
                        items={pages}
                      />
                      <Box sx={{padding: '6px', flex: 1, display: 'flex'}}>
                        <Outlet />
                      </Box>

                    </Box>
                  )}>

                    {pages.map((x, ix) => (
                      <Route path={`${x.path}`} element={x.component}>
                        {x.children && x.children.map((y, iy) => (
                          <Route path={`${y.path}`} element={y.component} />
                        ))}
                      </Route>
                    ))}
                    <Route path={':id/settings'} element={<DeviceSettings />} />


                  </Route>
                </Routes>
              </Box>
            </ApolloProvider>
          </AuthProvider>
        </ThemeProvider>
      </React.Suspense>
    </LocalizationProvider>
  );
}

export default App;
