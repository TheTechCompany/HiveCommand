import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from 'react-router-dom'
import singleSpaReact from "single-spa-react";
import App from "./App";

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: () => (
    <Router basename={`/${window.location.href.split('/').slice(3, 5).join("/")}` || process.env.PUBLIC_URL || "/dashboard/command"}>
      <App />
    </Router>),
  errorBoundary(err, info, props) {
    // Customize the root error boundary for your microfrontend here.
    return null;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
