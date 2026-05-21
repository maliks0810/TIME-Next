// features/attribution-analysis/routing/AttributionRoutes.tsx

import { RouteObject } from 'react-router-dom';
import MultiPersonaLandingPage from '../pages/MultiPersonaLandingPage';
import EquityWorkspacePage from '../pages/EquityWorkspacePage';
import EquityWizardPage from '../pages/EquityWizardPage';

export const attributionRoutes: RouteObject = {
  path: 'attribution',
  children: [
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
  ],
};