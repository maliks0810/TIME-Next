import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard/components/Dashboard';
import SecuritySetup from './pages/security-setup/securitySetup';
import TdmLayout from './components/TdmLayout';
import 'devextreme/dist/css/dx.light.css';

export default function App() {

  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'Security Setup';

    return () => {
      document.title = originalTitle;
    };
  }, []);

  return (
    <Routes>
      <Route element={<TdmLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="*" element={<Dashboard />} />
        <Route path="/security-setup" element={<SecuritySetup />} />
      </Route>
    </Routes>
  );
}
