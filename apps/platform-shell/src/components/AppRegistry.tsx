import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { appRegistry } from '../config/appRegistry';

export const AppRegistry: React.FC = () => {
    return (
        <Suspense fallback={<div className="loading">Loading application...</div>}>
            <Routes>
                {appRegistry.map((app) => (
                    <Route
                        key={app.name}
                        path={`/${app.route}/*`}
                        element={<app.component />}
                    />
                ))}
                <Route path="*" element={<div>Application not found</div>} />
            </Routes>
        </Suspense>
    )
}
