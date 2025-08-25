import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { RootLayout } from './layouts/RootLayout';
import { appRegistry } from '@platform/app-registry';

// add a circular progress for non loading items from mui materials
export function AppRouter() {
    const apps = appRegistry.getAllApps();

    return (
        <Routes>
            <Route path="/" element={<RootLayout />}>
                {apps.map((app) => (
                    <Route
                        key={app.id}
                        path={app.path === '/' ? undefined : app.path}
                        index={app.path === '/'}
                        element={
                            <Suspense>
                                <app.component />
                            </Suspense>
                        }
                    />
                ))}
            </Route>
        </Routes>
    );
}
