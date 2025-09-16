// @ts-nocheck
import { forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';

export const NaviLinkContainer = forwardRef((_props, ref) => {
    const navigate = useNavigate();

    useImperativeHandle(ref, () => ({
        showPopup: (linkBase: any) => {

            if (linkBase.newTab) {
                window.open(linkBase.url, '_blank')?.focus();
            } else if ((linkBase.url as string).toLowerCase().startsWith('http')) {
                try {
                    fetch(linkBase.url).catch(() => {
                        console.log('fetched url');
                    });
                } catch (err) {
                    console.log('fetched url');
                }
            } else {
                //assume this is an internal route
                navigate((linkBase.url.startsWith('/') ? '' : '/') + linkBase.url);
            }
        },
    }));
    return null;
});
