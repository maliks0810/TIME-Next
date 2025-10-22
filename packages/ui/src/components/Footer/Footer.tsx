import React from 'react';
// import tcwTime from '../assets/tcw-time.png';
import { footerLinksData } from './footer-links-data';
import { FooterLinks } from './footer-links.js';
import './Footer.scss';


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
            </div>
        </div>
    );
}
