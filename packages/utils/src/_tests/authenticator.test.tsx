/* eslint-disable */
import { describe, it, vi, beforeEach, expect as ex } from "vitest"
import { useOktaAuth } from '@okta/okta-react';
import { cleanup, render, renderHook, screen } from "@testing-library/react";
import { Authenticator } from "../hooks/Authentication/authenticator";
import { JSX } from "react";

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

        ex(screen.getByTestId('test-success')).toBeInTheDocument()

    })

})