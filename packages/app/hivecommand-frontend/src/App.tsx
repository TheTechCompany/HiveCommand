import React from "react";
import logo from "./logo.svg";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Grommet, Box } from "grommet";
import Dashboard from "./views/Dashboard";
import { BaseStyle } from "@hexhive/styles";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { AuthProvider } from '@hexhive/auth-ui'

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

function App(props: any) {

  return (
    <AuthProvider authorizationServer={authServer}>
      <Grommet
        style={{ display: "flex", flex: 1, height: "100%", width: "100%" }}
        full
        theme={BaseStyle}
        plain
      >
        <ApolloProvider client={client}>
          <Router basename={process.env.PUBLIC_URL || "/dashboard/command"}>
            <Box fill height="full" direction="column" flex>
              <Routes>
                <Route path={`*`} element={<Dashboard />} />
              </Routes>
            </Box>
          </Router>
        </ApolloProvider>
      </Grommet>
    </AuthProvider>
  );
}

export default App;
