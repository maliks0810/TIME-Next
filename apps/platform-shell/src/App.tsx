import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, AntDThemeProvider, DevExpressThemeProvider } from '@platform/ui';
import { AppRouter } from './router';
import { GenericDataProvider } from '@platform/utils';



export default function App() {
    return (
        <DevExpressThemeProvider>
            <ThemeProvider>
                <AntDThemeProvider>
                    <BrowserRouter>
                        <GenericDataProvider>
                            <AppRouter />
                        </GenericDataProvider>
                    </BrowserRouter>
                </AntDThemeProvider>
            </ThemeProvider>
        </DevExpressThemeProvider>
    )
}
