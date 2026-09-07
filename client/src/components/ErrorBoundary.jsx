import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('UI Error Boundary caught an exception:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-panel rounded-2xl p-8 border border-rose-500/30 bg-rose-950/20 text-center max-w-lg mx-auto my-12 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-950 border border-rose-500/40 flex items-center justify-center mx-auto mb-4 text-rose-400">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Something went wrong</h2>
          <p className="text-xs text-slate-400 mb-6">
            An unexpected error occurred in the user interface. Try refreshing the workspace.
          </p>
          {this.state.error?.message && (
            <div className="p-3 mb-6 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] font-mono text-rose-300 text-left overflow-x-auto">
              {this.state.error.message}
            </div>
          )}
          <button
            onClick={this.handleReset}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/30 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Application</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};
