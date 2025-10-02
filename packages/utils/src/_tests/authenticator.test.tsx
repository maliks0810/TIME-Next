import { describe, it, vi, beforeEach, expect as ex } from "vitest"
import { useOktaAuth } from '@okta/okta-react';
import { render, renderHook, screen } from "@testing-library/react";
import { Authenticator } from "../hooks/Authentication/authenticator";
import { JSX } from "react";

vi.mock('@okta/okta-react',() => ({
    useOktaAuth: vi.fn(),
}));

describe('authenticator', () => {

    let mockIsAuthenticated: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockIsAuthenticated = vi.fn();
    })

    function mockSuccess(): JSX.Element {
        return(
            <div data-testid='test-success'> Success </div>
        )
    };

    function mockLoading(): JSX.Element {
        return(
            <div data-testid='test-loading'> Loading </div>
        )
    };

    it('should return loading state if isAuthenticated is undefined ', async () => {
        mockIsAuthenticated.mockResolvedValue(undefined);

        // eslint-disable-next-line
        (useOktaAuth as any).mockReturnValue({
            oktaAuth: {
                isAuthenticated: mockIsAuthenticated
            }
        });

        const { result } = renderHook(() => Authenticator({success: mockSuccess(), loading: mockLoading()}));
        ex(result.current?.type).toEqual('div');
        
        render(result.current);
        ex(screen.getByTestId('test-loading')).toBeInTheDocument();
        ex(screen.getByTestId('test-loading')).toHaveTextContent('Loading');
    });

    // it('should return success state if isAuthenticated is true', async () => {
    //     mockIsAuthenticated.mockResolvedValue(true);

    //     (useOktaAuth as any).mockReturnValue({
    //         oktaAuth: {
    //             isAuthenticated: mockIsAuthenticated
    //         }
    //     });

    //     const { result } = renderHook(() => Authenticator({success: mockSuccess(), loading: mockLoading()}));
    //     ex(result.current?.type).toEqual('div');
        
    //     render(result.current);
    //     ex(screen.getByTestId('test-success')).toBeInTheDocument();
    //     ex(screen.getByTestId('test-success')).toHaveTextContent('Success');
    // })

})