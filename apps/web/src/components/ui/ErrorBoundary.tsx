import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

declare global {
  interface Window {
    gtag?: (command: string, action: string, params: Record<string, any>) => void;
  }
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      retryCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
      hasError: true,
    });

    // Envoyer l'erreur à un service de monitoring si disponible
    if (window.gtag) {
      window.gtag("event", "error", {
        error_message: error.message,
        error_stack: error.stack,
        component_stack: errorInfo.componentStack,
      });
    }
  }

  handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">Un problème est survenu</h1>

              <p className="text-gray-600 mb-6">
                {this.state.error?.message || "Une erreur inattendue est survenue."}
              </p>

              {this.state.retryCount < 3 && (
                <button
                  onClick={this.handleRetry}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réessayer
                </button>
              )}

              {this.state.retryCount >= 3 && (
                <div className="text-sm text-gray-500">
                  <p className="mb-2">Plusieurs tentatives ont échoué.</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Recharger la page
                  </button>
                </div>
              )}

              <details className="mt-4 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  Détails techniques
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                  {this.state.error?.stack}
                </pre>
              </details>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
