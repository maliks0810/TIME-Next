import TracerPage from './pages/TracerPage';
import { useDocumentTitle } from './hooks/useDocumentTitle';

export default function App() { 
    useDocumentTitle('TRACE | TIME');
    return <TracerPage />;
}
