import HomePage from './pages/HomePage';
import { tlog } from '@platform/utils';

export default function App() {

    tlog.config.loggingOp.postToLoggingIngress.ignoreDebug = true;
    tlog.config.globals.instanceId = crypto.randomUUID();
    tlog.config.loggingOp.loggingIngressUrl = 'https://commode-api-dev.np.tcw.com/v1/api/log/direct';
    tlog.config.globals.appName='time-next-platform-homepage';
    tlog.config.globals.environment = import.meta.env.VITE_APP_ENV;

    return <HomePage />;
}
