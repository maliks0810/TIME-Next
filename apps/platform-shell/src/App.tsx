import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@platform/ui';
import { AppRouter } from './router.tsx';


export default function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <AppRouter />
            </BrowserRouter>
        </ThemeProvider>
    )
}


