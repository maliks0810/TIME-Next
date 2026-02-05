export const FooterLinks = (props: { linkData: any }) => {
  const CONTACT_EMAIL = 'es-platformengineering@tcw.com';
  const SUBJECT = 'Request Support';

  return (
    <div className="links-container">
      <div className="links-header">{props.linkData.header}</div>

      {props.linkData.links?.map((link: any, index: number) => {
        const isContact = link.title === 'Contact';
        const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(SUBJECT)}`;

        return (
          <div className="link-container" key={index}>
            <a
              href={isContact ? mailto : link.url}
              className="footer-link"
              target={link.isExternal ? '_blank' : undefined}
              rel={link.isExternal ? 'noopener noreferrer' : undefined}
            >
              {link.title}
            </a>
          </div>
        );
      })}
    </div>
  );
};
