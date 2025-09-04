import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, AntDThemeProvider } from '@platform/ui';
import { AppRouter } from './router';


export default function App() {
    return (
        <ThemeProvider>
            <AntDThemeProvider>
                <BrowserRouter>
                    <AppRouter />
                </BrowserRouter>
            </AntDThemeProvider>
        </ThemeProvider>
    )
}
