import { useState, useEffect } from 'react';
import './lib/styles.scss';
import PerformanceAnalysisContent from './portals/performance/features/performance-analysis';


type AnalystRole = 'PMRA' | 'ClientService' | 'ProductServices' | 'PortfolioSpecialists';

export default function App() {
    const [role, setRole] = useState<AnalystRole | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                setRole('PMRA');
                console.log('Loading PMRA user configurations...');
            } catch {
                setError('Ran into an error loading user configuration.');
            }
        };
        loadConfig();
    }, []);

    if (error) {
        return (
            <div className="dramContainer" style={{ width: '100%' }}>
                <div style={{ padding: 16, color: 'crimson' }}>
                    Failed to load configuration: {error}
                </div>
            </div>
        );
    }

    if (!role) {
        return (
            <div className="dramContainer" style={{ width: '100%' }}>
                <div style={{ padding: 16 }}>Loading configuration…</div>
            </div>
        );
    }

    return (
        <div className="dramContainer" style={{ width: '100%' }}>
            {role === 'PMRA' ? null : <PerformanceAnalysisContent />}
        </div>
    );
}
