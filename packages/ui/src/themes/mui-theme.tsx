import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseLine from '@mui/material/CssBaseline';
import { ReactNode } from 'react';

// bring in more palettes from time starter deck

const root = document.documentElement;
const primaryTcwBlueColor = getComputedStyle(root).getPropertyValue('--tcw-blue-color').trim();
const secondaryTcwTealColor = getComputedStyle(root)
    .getPropertyValue('--secondary-tcw-teal-color')
    .trim();
const tcwDefaultMargin = getComputedStyle(root).getPropertyValue('--tcw-default-margin').trim();
const tcwDefaultPadding = getComputedStyle(root).getPropertyValue('--tcw-default-padding').trim();
const primaryTcwHighlightColor = getComputedStyle(root).getPropertyValue('--tcw-highlight-blue-color').trim();
const primaryTcwLightGrayColor = getComputedStyle(root).getPropertyValue('--tcw-light-gray-color').trim();

const muiTheme = createTheme({
    typography: {
        fontFamily: ['Lato'].join(','),
    },
    palette: {
        primary: {
            main: primaryTcwBlueColor,
            light: '#009CD5',
            dark: '#003265',
            contrastText: '#FFFFFF'
        },        
        secondary: {
            main: secondaryTcwTealColor,
            light: '#A6E3E2',
            dark: '#007270',
            contrastText: '#FFFFFF'
        },
        warning: {
            main: '#E55302',
        },
        error: {
            main: '#A33A29',
        },
        success: {
            main: '#70A94F',
        },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    '&.page-base': {
                        margin: tcwDefaultMargin,
                        padding: tcwDefaultPadding,
                    },
                    '&.row-base': {
                        backgroundColor: primaryTcwLightGrayColor,
                        '&:hover': {
                            backgroundColor: primaryTcwHighlightColor,
                        }
                        
                    },                    
                },
            },
        },
        MuiCardContent: {
          styleOverrides : {
            root: {
              padding: tcwDefaultPadding,
              '&:last-child': {
                paddingBottom: tcwDefaultPadding,
              }
            }
          }
        },
        MuiCardHeader: {
            styleOverrides: {
                title: {
                    color: primaryTcwBlueColor,
                    fontWeight: 550,
                },
            },
        },
    },
});

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    return (
        <MuiThemeProvider theme={muiTheme}>
            <CssBaseLine />
            {children}
        </MuiThemeProvider>
    );
}

export { muiTheme };
