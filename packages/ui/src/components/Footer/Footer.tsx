// @ts-nocheck

import React from 'react';
// import tcwTime from '../assets/tcw-time.png';
import { footerBottomLinksData, footerLinksData } from './footer-links-data.ts';
import { FooterLinks } from './footer-links.js';
import './Footer.module.scss'


export const Footer: React.FC = () => {
    return (
        <div className="footer-container">
            {/* <img src={tcwTime} alt="TcwTIME" className="footer-main-logo" /> */}
            <div className="footer-all-links-container">
                <div className="footer-center">
                    <div className="footer-links-container">
                        {footerLinksData?.map((footerLink, index) => (
                            <FooterLinks linkData={footerLink} key={index} />
                        ))}
                    </div>
                </div>
                <div className="footer-bottom">
                    {footerBottomLinksData?.map((bottomLink, index) => (
                        <a href={bottomLink.url} className="bottom-link" key={index}>
                            {bottomLink.header}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
