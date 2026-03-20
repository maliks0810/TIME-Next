import { useState, useEffect } from 'react';
import './lib/styles.scss';
import '../src/lib/styles.scss';
// // Should remove the add'l 'features' folder - redundant
// import OnePagerGeneric from './features/credit-research/features/one-pager-generic';
import EquityDashboard from './portals/equity-research';

// POC for now - Eventually will use Okta or configurations from the core-workflow-svc
type AnalystRole = 'Credit' | 'Equity' | 'Securitized';

export default function App() {
    const [role, setRole] = useState<AnalystRole | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                //POC Should load in config from somewhere (Okta/core-workflow-svc)
                setRole('Credit');
                console.log('Loading credit user configurations...');
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (e: any) {
                setError(e?.message ?? 'Ran into an error loading user configuration.');
            }
        };
        loadConfig();
    }, []);

    if (error) {
        return (
            <div className="prismContainer" style={{ width: '100%' }}>
                <div style={{ padding: 16, color: 'crimson' }}>
                    Failed to load configuration: {error}
                </div>
            </div>
        );
    }

    if (!role) {
        return (
            <div className="prismContainer" style={{ width: '100%' }}>
                <div style={{ padding: 16 }}>Loading analyst configuration…</div>
            </div>
        );
    }

    return (
        <div className="prismContainer" style={{ width: '100%' }}>
            {role === 'Credit' ? null : <EquityDashboard />}
        </div>
    );
}
