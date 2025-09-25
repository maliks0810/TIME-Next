import React from 'react';
import ReactDOM from 'react-dom/client';
import '@platform/styles/global.scss';
import App from './App'
import * as tlog from '@tcw/tlog';

tlog.config.loggingOp.postToLoggingIngress.ignoreDebug = true;
tlog.config.globals.instanceId = crypto.randomUUID();
tlog.config.loggingOp.loggingIngressUrl = 'https://commode-api-dev.np.tcw.com/v1/api/log/direct';

tlog.info('testing')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
