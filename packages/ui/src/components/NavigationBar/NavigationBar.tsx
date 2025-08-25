// @ts-nocheck

import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu } from '@mui/material';
import { navigationData } from './navigation.ts';
import { TopMenu } from './top-menu.js';
import tcwTime from '../../assets/tcw-time.png';
import './NavigationBar.scss';

export interface NavigationBarProps {
    appName?: string;
    onNavigate?: (route: string) => void;
}

export const Navbar: React.FC = () => {
    // const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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

    return (
        <div className="header-container">
            <button onClick={handleHomeClick}>
                <img src={tcwTime} alt="TcwTIME" className="main-logo" />
            </button>
            <div className="menu-container">
                {navigationData.map((header, index) => {
                    return <TopMenu key={index} menuData={header} />;
                })}
            </div>

                <img
                            // src={HomeSVG}
                            alt="title icon"
                            className="home-icon header-icon"
                />
                <img
                            // src={SearchSVG}
                            alt="title icon"
                            className="search-icon header-icon"
                />
                        <div className="profile-menu">
            <button className="profile-menu-header-button" onClick={handleClick}>
                <img
                            // src={ProfileSVG}
                            alt="title icon"
                            className="profile-icon header-icon"
                />
            </button>
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
                    <div className="profile-menu-user-name">Matthew Lee</div>
                    <button className="profile-menu-preferences" >
                        Preferences
                    </button>
                    <button className="profile-menu-preferences" >
                        Usage Metrics
                    </button>
                    <div className="profile-menu-log-off">Log Off</div>
                </div>
            </Menu>
        </div>

            {/* <HomeSVG className="home-icon header-icon" onClick={handleHomeClick} title='Return to main TIME screen' />
            <SearchSVG className="search-icon header-icon" />
            <ProfileMenu /> */}
        </div>
    );
}
