import { renderHook } from "@testing-library/react"
import { describe, vi, it, expect, beforeEach } from "vitest"
import { useBearerToken } from "../hooks/bearer-token"
import { useOktaAuth } from "@okta/okta-react";

vi.mock('@okta/okta-react',() => ({
    useOktaAuth: vi.fn(),
}));

describe('useBearerToken', () => {
    let mockGetOrRenewAccessToken: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockGetOrRenewAccessToken = vi.fn();
    });

    it('should return the token with "Bearer " prefix if token does not contain the prefix', async () => {
        mockGetOrRenewAccessToken.mockResolvedValue('testtoken');
        
        // eslint-disable-next-line
        (useOktaAuth as any).mockReturnValue({
            oktaAuth : {
                getOrRenewAccessToken: mockGetOrRenewAccessToken
            }
        });

        const { result } = renderHook(() => useBearerToken());
        const token = await result.current();
        expect(token).toBe('Bearer testtoken');
    });

    it('should return the token with "Bearer " prefix if token does contain the prefix', async () => {
        mockGetOrRenewAccessToken.mockResolvedValue('Bearer testtoken');

        // eslint-disable-next-line
        (useOktaAuth as any).mockReturnValue({
            oktaAuth: {
                getOrRenewAccessToken: mockGetOrRenewAccessToken,
            }
        });

        const { result } = renderHook(() => useBearerToken());
        const token = await result.current();
        expect(token).toBe('Bearer testtoken');
    });

    it('should throw an error when oktaAuth is falsey', async () => {
        // eslint-disable-next-line
        (useOktaAuth as any).mockReturnValue({});
        
        const { result } = renderHook(() => useBearerToken());
        await expect(result.current()).rejects.toThrow('Context for OktaAuth is not set or is unavailable');
    });

    it('should throw an error if the token is undefined', async () => {
        mockGetOrRenewAccessToken.mockResolvedValue(undefined);

        // eslint-disable-next-line
        (useOktaAuth as any).mockReturnValue({
            oktaAuth: {
                getOrRenewAccessToken: mockGetOrRenewAccessToken
            }
        });

        const { result } = renderHook(() => useBearerToken());
        await expect(result.current()).rejects.toThrow('Unable to retrieve Okta Access Token.')
    });

    it('should throw an error if the token is null', async () => {
        mockGetOrRenewAccessToken.mockResolvedValue(null);
        
        // eslint-disable-next-line
        (useOktaAuth as any).mockReturnValue({
            oktaAuth: {
                getOrRenewAccessToken: mockGetOrRenewAccessToken
            }
        });

        const { result } = renderHook(() => useBearerToken());
        await expect(result.current()).rejects.toThrow('Unable to retrieve Okta Access Token.')
    });
});