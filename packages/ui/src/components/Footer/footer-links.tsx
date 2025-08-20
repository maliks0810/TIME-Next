// @ts-nocheck

// import UpRightArrow from '../assets/arrow-up-right-svgrepo-com.svg';

export const FooterLinks = (props: { linkData: any }) => {
    return (
        <div className="links-container">
            <div className="links-header">{props.linkData.header}</div>
            {props.linkData.links?.map((link: any, index: number) => (
                <div className="link-container" key={index}>
                    <a
                        href={link.url}
                        className="footer-link"
                        target={link.isExternal ? '_blank' : ''}
                        rel={link.isExternal ? '"noopener noreferrer' : ''}
                    >
                        {link.title}
                    </a>

                    {/* {link.isExternal &&                                         <img
                                                    src={UpRightArrow}
                                                    alt="title icon"
                                                    className="footer-action-arrow"
                                                />} */}
                </div>
            ))}
        </div>
    );
};
