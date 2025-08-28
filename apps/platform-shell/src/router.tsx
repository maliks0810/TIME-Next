import { Routes, Route, Navigate  } from 'react-router-dom';
import { Suspense } from 'react';
import { RootLayout } from './layouts/RootLayout';
import { AppMetadata, appRegistry } from '@platform/app-registry';


// add a circular progress for non loading items from mui materials
export function AppRouter() {
    const apps = appRegistry.getAllApps();

    return (
        <Routes>
            <Route path="/" element={<RootLayout />}>
                {apps.map((app: AppMetadata) => {
                    if(app.external && app.url) {
                        return (
                            <Route
                                key={app.id}
                                path={app.path === '/' ? undefined: app.path}
                                index={app.path === '/'}
                                element={<Navigate to={app.url} replace />}
                            />
                        );
                    }
                    if(app.component) {
                        return (
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
                        );
                    }
                    return null;
                })}

            </Route>
        </Routes>
    );
}
