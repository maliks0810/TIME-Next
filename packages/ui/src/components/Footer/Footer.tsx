// @ts-nocheck
import React from 'react';
import tcwTime from '../../assets/tcw-time.png';
import newTcwLogo from '../../assets/updated-time-logo.png';
// import TcwLogo from '../../assets/tcw-footer-logo.svg?react';
import { footerLinksData, footerBottomLinksData } from './footer-links-data';
import { FooterLinks } from './footer-links.js';
import './Footer.scss';


export const Footer: React.FC = () => {
    return (
        <div className="footer-container">
            <div className="footer-row">
                <img src={newTcwLogo} alt="TcwTIME" className="footer-main-logo" />

                <div className="footer-all-links-container">
                    <div className="footer-center">
                        <div className="footer-links-container">
                            {footerLinksData?.map((footerLink, index) => (
                                <FooterLinks linkData={footerLink} key={index} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* <div className="footer-bottom">
                {footerBottomLinksData?.map((bottomLink, index) => (
                    <a href={bottomLink.url} className="bottom-link" key={index}>
                        {bottomLink.header}
                    </a>
                ))}
            </div> */}
        </div>
    );
}
