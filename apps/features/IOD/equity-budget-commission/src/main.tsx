import React from 'react';
import ReactDOM from 'react-dom/client';
import '@platform/styles/global.scss';
import App from './App'
import { BrowserRouter } from 'react-router-dom';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
