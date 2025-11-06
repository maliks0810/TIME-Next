import { AlertProvider } from './contexts/alert-context';
import ModelCatalog from './pages/model-catalog/model-catalog';

export default function App() {
    return (
        <AlertProvider>            
            <ModelCatalog />
        </AlertProvider>
    );
}
