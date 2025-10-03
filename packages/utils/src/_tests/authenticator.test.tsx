/* eslint-disable */
import { describe, it, vi, beforeEach, expect as ex } from "vitest"
import { useOktaAuth } from '@okta/okta-react';
import { cleanup, render, screen } from "@testing-library/react";
import { Authenticator } from "../hooks/Authentication/authenticator";

vi.mock('@okta/okta-react',() => ({
    useOktaAuth: vi.fn(),
}));

describe('authenticator', () => {
    const mockSuccessDiv = <div data-testid='test-success'>Success</div> 
    const mockLoadingDiv = <div data-testid='test-loading'>Loading</div>

    beforeEach(() => {
        cleanup();
    });

    it('should display the success component when user is authenticated', () => {
        (useOktaAuth as any).mockReturnValue({
            authState: { isAuthenticated: true},
            oktaAuth: {}
        });

        render(<Authenticator success={mockSuccessDiv} loading={mockLoadingDiv} />);

        ex(screen.getByTestId('test-success')).toBeInTheDocument();
    });

    it('should render the loading state when authState is undefined', () => {
        (useOktaAuth as any).mockReturnValue({
            authState: { isAuthenticated: undefined },
            oktaAuth: {}
        });

        render(<Authenticator success={mockSuccessDiv} loading={mockLoadingDiv} />);
        ex(screen.getByTestId('test-loading')).toBeInTheDocument();
    });

    it('should render nothing when the user is not auth and no loading prop is passed', () => {
        (useOktaAuth as any).mockReturnValue({
            authState: { isAuthenticated: false },
            oktaAuth: {
                setOriginalUri: vi.fn(),
                signInWithRedirect: vi.fn()
            },
        });

        const { container } = render(<Authenticator success={mockSuccessDiv} />);

        ex(container).toBeEmptyDOMElement();
    });

    it('should redirect when user is not authenticated', () => {
        //todo
    });
})