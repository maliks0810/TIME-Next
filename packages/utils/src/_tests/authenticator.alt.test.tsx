/* eslint-disable */
import { describe, it, vi, beforeEach, expect as ex } from "vitest"
import { cleanup, render } from "@testing-library/react";
import { Authenticator } from "../hooks/Authentication/authenticator";

const mockSetOriginalUri = vi.fn();
const mockSignInWithRedirect = vi.fn();

vi.mock('@okta/okta-react', () => ({
  useOktaAuth: () => ({
    authState: { isAuthenticated: false },
    oktaAuth: {
      setOriginalUri: mockSetOriginalUri,
      signInWithRedirect: mockSignInWithRedirect,
    },
  }),
}));

describe('AuthenticatorAlt', () => {
  const mockSuccessDiv = <div data-testid='test-success'>Success</div> 
  const mockLoadingDiv = <div data-testid='test-loading'>Loading</div>

  beforeEach(() => {
      cleanup();
  });

  it('should redirect when user is not authenticated', () => {
    render(<Authenticator success={mockSuccessDiv} loading={mockLoadingDiv} />);

    ex(mockSetOriginalUri).toHaveBeenCalledTimes(1);
    ex(mockSetOriginalUri).toHaveBeenCalledWith('/');
    ex(mockSignInWithRedirect).toHaveBeenCalledTimes(1);    
  });
})