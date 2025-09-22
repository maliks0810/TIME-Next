// @ts-nocheck  
/// <reference types="vite-plugin-svgr/client" />
import { useEffect, useRef, useState } from 'react';
import { Menu } from '@mui/material';
// import './Navbar.css';
import DownArrowSVG from '../../assets/arrow-down.svg?react';
// import arrowUp from '../assets/arrow-up.png';
import { Navigate, useNavigate } from 'react-router-dom';
import { InternalAppMetadata, ExternalAppMetadata } from '@platform/app-registry';
import { NaviLinkContainer } from './navi-link-container';


export const TopMenu = (props: { menuData: any }) => {
    const [selectedItem, setSelectedItem] = useState<string>(
        ((props.menuData.subHeaders as any[]) ?? [])[0]?.title ?? ''
    );
    const [selectedList, setSelectedList] = useState<any>();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const popupRef = useRef<any>();
    const open = Boolean(anchorEl);
    const navigate = useNavigate();
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSubMenuClick = (e: React.MouseEvent<HTMLButtonElement> | undefined) => {
        if (!e) {
            return;
        }

        setSelectedItem(e.currentTarget.title);
    };

    const handleMenuLinkClick = (link: (ExternalAppMetadata|InternalAppMetadata)) => {
        if (link.httpMethod !== 'POST'&& link.type === 'external') {
            handleClose();
            popupRef.current.showPopup(link);
        } else if (link.type === 'internal') {
            navigate(link.path);
            handleClose();
        }else {
        handleClose();

        fetch(link.url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: link.postBody
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error("POST Request failed:", error);
        });
    }
    };

    useEffect(() => {
        if (props.menuData) {
            const list = (props.menuData.subHeaders ?? []).find(
                (menu: any) => menu.title == selectedItem
            );
            setSelectedList(list);
        }
    }, [props.menuData, selectedItem]);

    const isLinkDisabled = (link: any): boolean => {
        return false;
    };

    return (
        <div className="header-menu-item">
            <NaviLinkContainer ref={popupRef} />
            <button onClick={handleClick}>
                <div className={'header-menu-item-container' + (open ? ' current' : '')}>
                    {props.menuData.header}
                    {/* <img
                                src={DownArrowSVG}
                                alt="title icon"
                                className={'menu-expand-arrow' + (open ? ' current' : '')}
                    /> */}
                    {/* <DownArrowSVG className={'menu-expand-arrow' + (open ? ' current' : '')} /> */}
                </div>
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
                anchorOrigin={{ vertical: 45, horizontal: 0 }}
            >
                <div className="sub-menu-items-dropdown-container">
                    <div className="sub-menu-titles-container">
                        {props.menuData.subHeaders?.map((subMenu: any, index: number) => (
                            <div
                                className={
                                    selectedItem == subMenu.title
                                        ? 'sub-menu-title-container sub-menu-title-container-selected'
                                        : 'sub-menu-title-container'
                                }
                                key={index}
                            >
                                <button
                                    onClick={handleSubMenuClick}
                                    className={
                                        selectedItem == subMenu.title
                                            ? 'sub-menu-title sub-menu-title-selected'
                                            : 'sub-menu-title'
                                    }
                                    title={subMenu.title}
                                >
                                    {subMenu.title}
                                    {/* {selectedItem == subMenu.title && (
                                        <img
                                            src={arrowUp}
                                            alt="arrow"
                                            className="sub-menu-extension-arrow"
                                        />
                                    )} */}
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="sub-menu-links-container">
                        {selectedList?.links?.map((link: any, index: number) => (
                            <button
                                disabled={isLinkDisabled(link)}
                                className="sub-menu-link"
                                key={index}
                                onClick={() => handleMenuLinkClick(link)}
                            >
                                {link.title}
                            </button>
                        ))}
                    </div>
                </div>
            </Menu>
        </div>
    );
};
