// @ts-nocheck  
import { useEffect, useRef, useState } from 'react';
import { Menu, Button } from '@mui/material';
import DownArrowSVG from '../../assets/arrow-down.svg?react';
import arrowUp from '../../assets/arrow-up.png';
import { Navigate, useNavigate } from 'react-router-dom';
import { InternalAppMetadata, ExternalAppMetadata } from '@platform/app-registry';
import { fireAndForget } from './utils';
import { useUserInfo, useUpdateUserInfo, addToFavorites } from '@platform/utils';
import { NaviLinkContainer } from './navi-link-container';
import { IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';


export const TopMenu = (props: { 
                            menuData: any,
                            openMenu: string | null,
                            setOpenMenu: (menu: string | null) => void,
                            handleClick: (event: React.MouseEvent<HTMLButtonElement>, menuName: string) => void,
                            handleClose: () => void 
                        }) => {
    const [selectedItem, setSelectedItem] = useState<string>(
        ((props.menuData.subHeaders as any[]) ?? [])[0]?.title ?? ''
    );
    const [selectedList, setSelectedList] = useState<any>();
    const popupRef = useRef<any>();
    const navigate = useNavigate();
    const userInfo = useUserInfo();
    const updateUserInfo = useUpdateUserInfo();

    const handleSubMenuClick = (e: React.MouseEvent<HTMLButtonElement> | undefined) => {
        if (!e) {
            return;
        }

        setSelectedItem(e.currentTarget.title);
    };

    const handleMenuLinkClick = (link: (ExternalAppMetadata|InternalAppMetadata)) => {
        if (link.httpMethod !== 'POST' && link.type === 'external') {
            props.handleClose();
            popupRef.current.showPopup(link);
        } else if (link.type === 'internal') {
            navigate(link.path);
            fireAndForget(() => {
                const updated = addToFavorites(link, userInfo);
                return updateUserInfo(updated);
            });
            props.handleClose();
        } else {
            props.handleClose();
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

    function copyToClipboard(link: (ExternalAppMetadata|InternalAppMetadata)): void {
        let linkUrl = new String();
        if (link.type === 'internal' && link.path) {
            const cleanPath = link.path.replace(/\s/g, "");
            linkUrl = window.location.origin.concat(cleanPath);
        } else if (link.type === 'external') {
            linkUrl = link.url;
        }
  
        navigator.clipboard.writeText(linkUrl).then(() => {
            console.log("Copied to clipboard:", linkUrl);
        }).catch((err) => {
            console.error("Failed to copy:", linkUrl);
        });
    }

    useEffect(() => {
        if (props.menuData) {
            const list = (props.menuData.subHeaders ?? []).find(
                (menu: any) => menu.title == selectedItem
            );
            setSelectedList(list);
        }
    }, [props.menuData, selectedItem]);

    const isLinkDisabled = (link: any): boolean => {
        return link.disabled;
    };

    return (
        <div className="header-menu-item">
            <NaviLinkContainer ref={popupRef} />
            <button
                onClick={(e) => props.handleClick(e, props.menuData.header)}>
                <div className={'header-menu-item-container' + (props.openMenu === props.menuData.header ? ' current' : '')}>
                    {props.menuData.header}
                    <DownArrowSVG className={'menu-expand-arrow' + (props.openMenu === props.menuData.header ? ' current' : '')} />
                </div>
            </button>
            <Menu
                id="basic-menu"
                anchorEl={props.openMenu === props.menuData.header ? document.querySelector('.header-menu-item-container.current') : null}
                open={props.openMenu === props.menuData.header}
                onClose={props.handleClose}
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
                                    {selectedItem == subMenu.title && (
                                        <img
                                            src={arrowUp}
                                            alt="arrow"
                                            className="sub-menu-extension-arrow"
                                        />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="sub-menu-links-container">
                        {selectedList?.links?.map((app: (ExternalAppMetadata|InternalAppMetadata), index: number) =>
                            <div className="sub-menu-link" key={index}>
                                <Button
                                    disabled={isLinkDisabled(app)}
                                    onClick={() => handleMenuLinkClick(app)}
                                >
                                    {app.title}
                                </Button>
                                <IconButton
                                    sx={{ display: app.type === 'internal' ? '' : 'none' }}
                                    aria-label="copy link"
                                    disabled={isLinkDisabled(app)}
                                    onClick={() => copyToClipboard(app)}
                                    size="small" 
                                >  
                                    <ContentCopyIcon fontSize="inherit" />
                                </IconButton>
                            </div>

                        )}
                         
                    </div>
                </div>
            </Menu>
        </div>
    );
};
              