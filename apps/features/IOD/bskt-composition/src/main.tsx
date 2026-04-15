import React from 'react';
import ReactDOM from 'react-dom/client';
import '@platform/styles/global.scss';
import App from './App'
import "devextreme/dist/css/dx.light.css";


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
