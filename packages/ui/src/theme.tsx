import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseLine from '@mui/material/CssBaseline';
import { ReactNode } from 'react';

// bring in more palettes from time starter deck

const root = document.documentElement;
const primaryTcwBlueColor = getComputedStyle(root).getPropertyValue('--tcw-blue-color').trim();
const secondaryTcwTealColor = getComputedStyle(root).getPropertyValue('--secondary-tcw-teal-color').trim();

const theme = createTheme({
    typography: {
        fontFamily: [
            'Lato'
        ].join(',')
    },
  palette: {
    primary: {
      main: primaryTcwBlueColor,
      light: '#009CD5',
      dark: '#003265'
    },
    secondary: {
      main: secondaryTcwTealColor,
      light: '#A6E3E2',
      dark: '#007270'
    },
    warning: {
      main: '#E55302'
    },
    error: {
      main: '#A33A29'
    },
    success: {
      main: '#70A94F'
    }
  },
});

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    return (
        <MuiThemeProvider theme={theme}>
            <CssBaseLine />
            {children}
        </MuiThemeProvider>
    )
}

export { theme };
