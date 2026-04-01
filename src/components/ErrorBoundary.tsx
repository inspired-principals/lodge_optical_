import React, { type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<Props, State> {
  declare props: Readonly<Props>;

  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Lodge Optical UI error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
          <div className="section-box max-w-xl p-8 text-center shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Something needs a quick refresh</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              A page component failed to load correctly. You can return home or refresh to continue.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                <RefreshCcw size={16} />
                Refresh page
              </button>
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Return home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
