
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-red-600">
                Application Error
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Something went wrong. Please refresh the page or try again later.
              </p>
              {this.state.error && (
                <details className="text-left text-sm text-gray-500 bg-gray-100 p-2 rounded">
                  <summary>Error Details</summary>
                  <pre className="mt-2 whitespace-pre-wrap">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              <div className="space-y-2">
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Refresh Page
                </Button>
                <Button
                  onClick={() => {
                    this.setState({ hasError: false, error: undefined });
                    window.location.href = '/';
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
