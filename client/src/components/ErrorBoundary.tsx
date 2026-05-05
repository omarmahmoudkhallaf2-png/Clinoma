import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
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
        <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
          <div className="max-w-xl w-full bg-card border-2 border-border p-12 rounded-[4rem] shadow-2xl space-y-8 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-12 h-12" />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight">System Interruption</h1>
              <p className="text-muted-foreground font-bold leading-relaxed">
                We encountered a critical error while processing your request. Our autonomous recovery system has been notified.
              </p>
              <div className="p-4 bg-secondary/50 rounded-2xl font-mono text-xs text-rose-600 text-left overflow-auto max-h-32">
                {this.state.error?.message}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => window.location.reload()}
                className="flex-1 px-8 py-4 bg-primary text-white rounded-[2rem] font-black flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 transition-all"
              >
                <RefreshCw className="w-5 h-5" /> Reload OS
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="flex-1 px-8 py-4 bg-secondary text-foreground rounded-[2rem] font-black flex items-center justify-center gap-3 hover:bg-secondary/80 transition-all"
              >
                <Home className="w-5 h-5" /> Back to Safety
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
