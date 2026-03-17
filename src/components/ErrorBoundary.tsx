import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full border border-red-200">
            <h2 className="text-xl font-bold text-red-600 mb-4">Algo salió mal</h2>
            <p className="text-slate-700 mb-4">Ha ocurrido un error inesperado en la aplicación.</p>
            <pre className="bg-slate-100 p-4 rounded-lg text-sm overflow-auto text-red-800">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
