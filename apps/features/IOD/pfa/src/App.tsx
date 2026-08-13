import PfaPage from './pages/PfaPage';
import { PfaAccessGate } from './features/auth/PfaAccessGate';
import { Providers } from './providers';

export default function App() {
    return (
        <Providers>
            <PfaAccessGate>
                <PfaPage />
            </PfaAccessGate>
        </Providers>
    );
}
