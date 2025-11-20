import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseLine from '@mui/material/CssBaseline';
import { ReactNode } from 'react';

// bring in more palettes from time starter deck

const root = document.documentElement;
const primaryTcwBlueColor = getComputedStyle(root).getPropertyValue('--tcw-blue-color').trim();
// const primaryTcwBlueContrastTextColor = getComputedStyle(root)
//     .getPropertyValue('--tcw-blue-contrast-text-color')
//     .trim();
const secondaryTcwTealColor = getComputedStyle(root)
    .getPropertyValue('--secondary-tcw-teal-color')
    .trim();
const tcwDefaultMargin = getComputedStyle(root).getPropertyValue('--tcw-default-margin').trim();
const tcwDefaultPadding = getComputedStyle(root).getPropertyValue('--tcw-default-padding').trim();
const primaryTcwHighlightColor = getComputedStyle(root)
    .getPropertyValue('--tcw-highlight-blue-color')
    .trim();
const primaryTcwLightGrayColor = getComputedStyle(root)
    .getPropertyValue('--tcw-light-gray-color')
    .trim();

    //TODO: Add contrast text colors
    //TODO: Define color vars in CSS
    //TODO: Add 'info' to palette
const muiTheme = createTheme({
    typography: {
        fontFamily: ['Lato'].join(','),
    },
    palette: {
        primary: {
            main: primaryTcwBlueColor,
            light: '#009CD5',
            dark: '#003265',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: secondaryTcwTealColor,
            light: '#A6E3E2',
            dark: '#007270',
            contrastText: '#FFFFFF',
        },
        warning: {
            main: '#E55302',
            light: '#e28d60ff',
            dark: '#e5510271',
            contrastText: '#FFFFFF',
        },
        error: {
            main: '#A33A29',
            light: '#a55d52ff',
            dark: '#a339296c',
            contrastText: '#FFFFFF',
        },
        success: {
            main: '#70A94F',
            light: '#93a787ff',
            dark: '#70a94fb2',
            contrastText: '#FFFFFF',
        },
        info: {
            main: '#009CD5',
            light: '#51b0d3ff',
            dark: '#1a4570ff',
            contrastText: '#FFFFFF',
        },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    //TODO: Add to documentation
                    '&.page-base': {
                        padding: tcwDefaultPadding,
                        width: '100%',
                    },
                    //TODO: Add to documentation
                    '&.row-base': {
                        backgroundColor: primaryTcwLightGrayColor,
                        '&:hover': {
                            backgroundColor: primaryTcwHighlightColor,
                        },
                    },
                },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: ({theme}) => ({
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    marginBottom: tcwDefaultMargin,
                    ...theme.typography.h4,
                }),
                
            },
            
        },
        MuiCardContent: {
            styleOverrides: {
                root: {
                    padding: tcwDefaultPadding,
                    '&:last-child': {
                        paddingBottom: tcwDefaultPadding,
                    },
                },
            },
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
