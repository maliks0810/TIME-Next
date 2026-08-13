// PageHeader.tsx
// A modern, compact app header. No background fill — the brand gradient is
// applied to the TITLE text. Ships with an inline yellow Power BI logo.
// Layout: [ logo + title/subtitle ] ----------------- [ tabs | View ] (right)

import React from 'react';
import './header.css';

/** Inline Power BI logo (yellow column-chart mark). Scales via the `size` prop. */
export const PowerBILogo: React.FC<{ size?: number }> = ({ size = 30 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    role="img"
    aria-label="Power BI"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="pbiYellow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FBD525" />
        <stop offset="100%" stopColor="#F2C811" />
      </linearGradient>
    </defs>
    {/* Four rounded columns of increasing height (official-style motif) */}
    <rect x="3" y="18" width="5.5" height="11" rx="1.6" fill="url(#pbiYellow)" />
    <rect x="10" y="12" width="5.5" height="17" rx="1.6" fill="url(#pbiYellow)" />
    <rect x="17" y="7" width="5.5" height="22" rx="1.6" fill="url(#pbiYellow)" />
    <rect x="24" y="2" width="5.5" height="27" rx="1.6" fill="url(#pbiYellow)" />
  </svg>
);

interface PageHeaderProps {
  /** Main heading text, e.g. "ePBRS Insights". */
  title: string;
  /** Optional smaller line under the title. */
  subtitle?: string;
  /** Optional custom icon. Defaults to the inline yellow Power BI logo. */
  icon?: React.ReactNode;
  /** Tabs slot — rendered on the RIGHT, next to the View dropdown. */
  tabs?: React.ReactNode;
  /** Actions slot — the View dropdown, sits to the right of the tabs. */
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon = <PowerBILogo size={30} />,
  tabs,
  actions,
}) => {
  return (
    <header className="app-header">
      {/* Left: logo + title/subtitle */}
      <div className="app-header__brand">
        <span className="app-header__badge" aria-hidden="true">
          {icon}
        </span>
        <div className="app-header__titles">
          <h1 className="app-header__title">{title}</h1>
          {subtitle && <p className="app-header__subtitle">{subtitle}</p>}
        </div>
      </div>

      {/* Right cluster: tabs and the View dropdown grouped together */}
      {(tabs || actions) && (
        <div className="app-header__right">
          {tabs && <div className="app-header__tabs">{tabs}</div>}
          {actions && <div className="app-header__actions">{actions}</div>}
        </div>
      )}
    </header>
  );
};

export default PageHeader;
