import React from "react";

type FallbackProps = {
  error: unknown;
  reset: () => void;
};

type Props = {
  children: React.ReactNode;
  fallback?: (props: FallbackProps) => React.ReactNode;
  onError?: (error: unknown, info: React.ErrorInfo) => void;
};

type State = {
  error: unknown | null;
  resetKey: number;
};

// The actual boundary must be a class (React requirement)
class ErrorBoundaryImpl extends React.Component<Props, State> {
  state: State = { error: null, resetKey: 0 };

  static getDerivedStateFromError(error: unknown) {
    return { error, resetKey: 0 } as Partial<State>;
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    this.props.onError?.(error, info);
    console.error("ErrorBoundary caught:", error, info);
  }

  reset = () => this.setState((s) => ({ error: null, resetKey: s.resetKey + 1 }));

  render() {
    if (this.state.error) {
      const fallback = this.props.fallback?.({
        error: this.state.error,
        reset: this.reset,
      });

      return (
        fallback ?? (
          <div style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}>
            <h2>Something went wrong.</h2>
            <pre style={{ whiteSpace: "pre-wrap" }}>{String(this.state.error)}</pre>
            <button onClick={this.reset}>Try again</button>
          </div>
        )
      );
    }

    // resetKey forces subtree remount on reset (optional but useful)
    return <React.Fragment key={this.state.resetKey}>{this.props.children}</React.Fragment>;
  }
}

/**
 * Functional wrapper — your app only imports/uses this function component.
 */
export function ErrorBoundary(props: Props) {
  return <ErrorBoundaryImpl {...props} />;
}