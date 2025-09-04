import { ConfigProvider } from 'antd';
import { ReactNode } from 'react';

const root = document.documentElement;
const primaryTcwBlueColor = getComputedStyle(root).getPropertyValue('--tcw-blue-color').trim();
const secondaryTcwTealColor = getComputedStyle(root).getPropertyValue('--secondary-tcw-teal-color').trim();

const antdTheme = {
  token: {
    colorPrimary: primaryTcwBlueColor,
    colorSecondary: secondaryTcwTealColor,
    colorWarning: '#E55302',
    colorError: '#A33A29',
    colorSuccess: '#70A94F',
  },
};

interface AntDThemeProviderProps {  
  children: ReactNode;  
}

function AntDThemeProvider({ children }: AntDThemeProviderProps) {  
  return (  
    <ConfigProvider theme={antdTheme}>  
      {children}  
    </ConfigProvider>  
  );  
}

export { antdTheme, AntDThemeProvider };