import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, AntDThemeProvider } from '@platform/ui';
import { AppRouter } from './router';
import { GenericDataProvider } from '@platform/utils';


export default function App() {
    return (
        <ThemeProvider>
            <AntDThemeProvider>
                <BrowserRouter>
                    <GenericDataProvider>
                        <AppRouter />
                    </GenericDataProvider>
                </BrowserRouter>
            </AntDThemeProvider>
        </ThemeProvider>
    )
}
