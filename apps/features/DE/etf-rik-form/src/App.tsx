import FormCreatePage from './pages/FormCreatePage';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthGuard } from './components/guards/auth'; 

const queryClient = new QueryClient();
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="*" element={<Dashboard />} />
          <Route path="/detail/:id" element={<FormCreatePage />} />
        </Routes>
      </AuthGuard>
    </QueryClientProvider>

  );
}

export default App;


