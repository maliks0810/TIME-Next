// features/attribution-analysis/routing/AttributionRouter.tsx

import React from 'react';
import { useRoutes, RouteObject } from 'react-router-dom';
import MultiPersonaLandingPage from '../pages/MultiPersonaLandingPage';
import EquityWorkspacePage from '../pages/EquityWorkspacePage';
import EquityWizardPage from '../pages/EquityWizardPage';

const routes: RouteObject[] = [
  {
    path: 'dashboard',
    element: <MultiPersonaLandingPage />,
  },
  {
    path: 'workspace',
    element: <EquityWorkspacePage />,
  },
  {
    path: 'wizard',
    element: <EquityWizardPage />,
  },
];

export const AttributionRouter: React.FC = () => {
  const element = useRoutes(routes);
  return element;
};
