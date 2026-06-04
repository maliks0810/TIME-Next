import axios from 'axios';

const DEFAULT_CONTENT_TYPE = 'application/json';
const DEFAULT_TIMEOUT = 120000; // 2 min

export const generateUUID = (): string => crypto.randomUUID();

export const getOktaAccessToken = (): string | undefined => {
	try {
		const raw = localStorage?.getItem('okta-token-storage');
		const token: unknown = JSON.parse(raw ?? '')?.accessToken?.accessToken;
		if (typeof token !== 'string' || !token) return undefined;
		return token.startsWith('Bearer ') ? token.slice('Bearer '.length) : token;
	} catch {
		return undefined;
	}
};

export const serviceRequest =
	(
		baseURL: string,
		contentType: string = DEFAULT_CONTENT_TYPE,
		timeout: number = DEFAULT_TIMEOUT
	) =>
		() => {
			const accessToken = getOktaAccessToken();
			const authorization = accessToken ? `Bearer ${accessToken}` : undefined;

			return axios.create({
				baseURL,
				timeout,
				headers: {
					'Content-Type': contentType,
					'X-Correlation-ID': generateUUID(),
					...(authorization && { Authorization: authorization }),
				},
			});
		};
