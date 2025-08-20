import { default as React } from 'react';
export interface NavigationBarProps {
    appName?: string;
    onNavigate?: (route: string) => void;
}
export declare const Navbar: React.FC;
