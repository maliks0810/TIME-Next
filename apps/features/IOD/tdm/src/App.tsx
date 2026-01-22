import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard/components/Dashboard';
import SecuritySetup from './pages/security-setup/securitySetup';
import 'devextreme/dist/css/dx.light.css';

export default function App() {
    return (
        <Routes>
            <Route index element={<Dashboard />} />
            <Route path="security-setup" element={<SecuritySetup />} />
        </Routes>
    )
}
