"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  context?: string; // e.g., "project", "test-cases", "defects"
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(
      `Error in ${this.props.context || "component"}:`,
      error,
      errorInfo,
    );
    this.setState({ errorInfo });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-800 flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5" />
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-red-700">
              {this.props.context
                ? `An error occurred while loading ${this.props.context}.`
                : "An unexpected error occurred."}
            </p>
            {this.state.error && (
              <p className="text-xs text-red-600 font-mono bg-red-100 p-2 rounded">
                {this.state.error.message}
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleReset}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier use with hooks
interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  context?: string;
  fallback?: ReactNode;
}

export function ErrorBoundaryWrapper({
  children,
  context,
  fallback,
}: ErrorBoundaryWrapperProps) {
  const [resetKey, setResetKey] = React.useState(0);

  const handleReset = () => {
    setResetKey((prev) => prev + 1);
  };

  return (
    <ErrorBoundary
      key={resetKey}
      context={context}
      fallback={fallback}
      onReset={handleReset}
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
