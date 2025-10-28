// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu } from '@mui/material';
import { navigationData } from './navigation.ts';
import { useUserInfo } from '@platform/utils';
import { IconButton } from '@mui/material';
import { InternalAppMetadata, ExternalAppMetadata } from '@platform/app-registry';
import { TopMenu } from './top-menu';
import tcwTime from '../../assets/tcw-time.png';
import HomeSVG from '../../assets/HomeSVG.svg?react';
import SearchSVG from '../../assets/SearchSVG.svg?react';
import ProfileSVG from '../../assets/ProfileSVG.svg?react';
import { appRegistry } from '@platform/app-registry';
import './NavigationBar.scss';

export interface NavigationBarProps {
    appName?: string;
    onNavigate?: (route: string) => void;
}


export const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const userInfo = useUserInfo();
    const handleHomeClick = () => {
        navigate('/');
    };

    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const transformLinks = (inputArray: (InternalAppMetadata|ExternalAppMetadata)[]) => {    
        const headerMap = new Map();    

        inputArray.forEach(item => {    
    
            if (!item.header || !item.subHeader) return;    

            if (!headerMap.has(item.header)) {
            headerMap.set(item.header, new Map());
            }

            const subHeaderMap = headerMap.get(item.header);    
    
            if (!subHeaderMap.has(item.subHeader)) {
            subHeaderMap.set(item.subHeader, []);
            }

            const links = subHeaderMap.get(item.subHeader);    

            links.push({    
                title: item.title,    
                url: item.url,    
                newTab: item.newTab,
                disabled: item.disabled,
                path: item.path,
                type: item.type
            });    
        });
    
        const result = [];    
            
        for (const [header, subHeaderMap] of headerMap.entries()) {    
            const subHeaders = [];    
            
            for (const [subHeaderTitle, links] of subHeaderMap.entries()) {    
            subHeaders.push({    
                title: subHeaderTitle,    
                links,    
            });    
            }    
            
            result.push({    
            header,    
            subHeaders,    
            });    
        }    
            
        return result;    
    };

    const handleSendEmail = () => {
        const recipientEmail = 'es-platformengineering@tcw.com';
        const subject = 'Request Support';

        const encodedSubject = encodeURIComponent(subject);

        window.open(`mailto:${recipientEmail}?subject=${encodedSubject}`);
    };

    return (
        <div className="header-container">
            <button onClick={handleHomeClick}>
                <img src={tcwTime} alt="TcwTIME" className="main-logo" />
            </button>

            {/* New Navbar Loading from App Registry */}
            <div className="menu-container">
                {transformLinks(appRegistry.getAllApps()).map((header, index) => {
                    return <TopMenu key={index} menuData={header} />;
                })}
            </div>
                {/* <SearchSVG className="header-icon" /> */}
                {/* <img
                            src={SearchSVG}
                            alt="search icon"
                            className="header-icon"
                /> */}
            <div className="profile-menu">
                <IconButton className="profile-menu-header-button" onClick={handleClick}>
                    <ProfileSVG className="profile-icon header-icon" />
                {/* <img
                            src={ProfileSVG}
                            alt="title icon"
                            className="profile-icon header-icon"
                /> */}
                </IconButton>
                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                        disablePadding: true,
                        
                    }}
                    classes={{ paper: 'menu-paper' }}
                    slotProps={{ paper: { square: true } }}
                    anchorOrigin={{vertical: 50, horizontal: -125}}
                >
                    <div className="profile-dropdown-content">
                        <div className="profile-menu-user-name">{userInfo.name}</div>
                        <button className="profile-menu-preferences" >
                            Preferences
                        </button>
                        <button className="profile-menu-preferences" onClick={handleSendEmail}>
                            Request Support
                        </button>
                        {/* <div className="profile-menu-log-off">Log Off</div> */}
                    </div>
                </Menu>
            </div>

            {/* <HomeSVG className="home-icon header-icon" onClick={handleHomeClick} title='Return to main TIME screen' />
            <SearchSVG className="search-icon header-icon" />
            <ProfileMenu /> */}
        </div>
    );
}
