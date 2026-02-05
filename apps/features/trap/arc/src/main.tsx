import React from 'react';
import ReactDOM from 'react-dom/client';
import '../../../../../packages/styles/src/global.scss'
import '../src/lib/styles.scss';
import App from './App';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
