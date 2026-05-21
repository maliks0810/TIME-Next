// features/attribution-analysis/routing/useAttributionNavigation.ts

import { useNavigate } from 'react-router-dom';
import {
  ATTRIBUTION_ROUTES,
  AttributionRouteKey,
} from './routes';

export const useAttributionNavigation = () => {
  const navigate = useNavigate();

  const goTo = (route: AttributionRouteKey): void => {
    navigate(ATTRIBUTION_ROUTES[route]);
  };

  return {
    goToDashboard: (): void => goTo('dashboard'),
    goToWorkspace: (): void => goTo('workspace'),
    goToWizard: (): void => goTo('wizard'),
    goTo,
  };
};
