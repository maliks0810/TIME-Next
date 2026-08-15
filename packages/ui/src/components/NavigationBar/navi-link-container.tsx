// @ts-nocheck
import { forwardRef, useImperativeHandle } from 'react';
import { fireAndForget } from './utils';
import { useUserInfo, useUpdateUserInfo, addToFavorites } from '@platform/utils';
import { useNavigate } from 'react-router-dom';

export const NaviLinkContainer = forwardRef((_props, ref) => {
    const navigate = useNavigate();
    const userInfo = useUserInfo();
    const updateUserInfo = useUpdateUserInfo();

    useImperativeHandle(ref, () => ({
        showPopup: (linkBase: any) => {

            fireAndForget(() => {
                const updated = addToFavorites(linkBase, userInfo);
                return updateUserInfo(updated);
            });

            // if (linkBase.newTab || linkBase.newTab == undefined) {
            //     window.open(linkBase.url, '_blank')?.focus();
            // } else if ((linkBase.url as string).toLowerCase().startsWith('http')) {
            //     try {
            //         fetch(linkBase.url).catch(() => {
            //             console.log('fetched url');
            //         });
            //     } catch (err) {
            //         console.log('fetched url');
            //     }
            // } else {
            //     //assume this is an internal route
            //     navigate((linkBase.url.startsWith('/') ? '' : '/') + linkBase.url);
            // }

            var url = (linkBase.url as string).toLowerCase();
            if (!url.startsWith('http')) {                
                url = window.location.origin + (url.startsWith('/') ? '' : '/') + url;
            }

            window.open(url, '_blank')?.focus();
        },
    }));
    return null;
});
