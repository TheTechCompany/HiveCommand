import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { SchematicViewerProvider } from '@hive-command/schematic-viewer';
import { ReactFlowProvider } from 'reactflow';
import { BrowserRouter as Router } from 'react-router-dom';
ReactDOM.render(
  <React.StrictMode>
    <Router>
    <ReactFlowProvider>
      <SchematicViewerProvider>

    <App />
    </SchematicViewerProvider>
    </ReactFlowProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root') as HTMLElement
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
