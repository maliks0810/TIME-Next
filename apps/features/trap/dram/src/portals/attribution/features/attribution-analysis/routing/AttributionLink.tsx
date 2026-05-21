// features/attribution-analysis/routing/AttributionLink.tsx

import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import {
  ATTRIBUTION_ROUTES,
  AttributionRouteKey,
} from './routes';

type Props = Omit<LinkProps, 'to'> & {
  route: AttributionRouteKey;
};

export const AttributionLink: React.FC<Props> = ({
  route,
  ...rest
}) => {
  return <Link to={ATTRIBUTION_ROUTES[route]} {...rest} />;
};