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
    },
    secondary: {
      main: secondaryTcwTealColor,
    },
  },
  components: {
    MuiCardHeader: {
      styleOverrides: {
        title: {
          title: { 
            fontSize: '32px', 
            color: 'primary.main', 
            fontWeight: 'bold'
          }
        }
      }
    }
  }
});

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  console.log(theme)
    return (
        <MuiThemeProvider theme={theme}>
            <CssBaseLine />
            {children}
        </MuiThemeProvider>
    )
}

export { theme };
