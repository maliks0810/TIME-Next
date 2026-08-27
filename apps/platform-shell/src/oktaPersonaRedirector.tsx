import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';

export function OktaRoleRedirector() {
	const { oktaAuth, authState } = useOktaAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const hasRedirectedRef = useRef(false);

	useEffect(() => {
		if (location.pathname === '/') {
			hasRedirectedRef.current = false;
		}
	}, [location.pathname]);

	useEffect(() => {
		if (!authState?.isAuthenticated) return;

		if (location.pathname !== '/') return;

		if (hasRedirectedRef.current) return;
		hasRedirectedRef.current = true;

		(async () => {
		const claimFromIdToken =
			authState.idToken?.claims?.TIME_Role as string | undefined;

		let role = claimFromIdToken;
		if (!role) {
			const user = await oktaAuth.getUser();
			/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
			role = (user as any)?.TIME_Role;
		}

		
		if (!role) {
			navigate('/', { replace: true });
			return;
		}

		switch (role) {
			case 'Risk Manager':
				navigate('/risk/arc', { replace: true });
				break;


			case 'EquityResearch':
				navigate('/trap', { replace: true });
				break;

			default:
				navigate('/', { replace: true });
				break;
		}
		})().catch((e) => {
			console.error('Role-based redirect failed', e);
			hasRedirectedRef.current = false;
		});
	}, [
		authState?.isAuthenticated,
		authState?.idToken,
		oktaAuth,
		navigate,
		location.pathname,
	]);

	return null;
}