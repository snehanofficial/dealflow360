import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldOff, FileSearch, ServerCrash, ArrowLeft, Home } from 'lucide-react';

/* ─── Shared layout ───────────────────────────────────────────────────────── */
interface ErrorLayoutProps {
  icon: React.ReactNode;
  code: string;
  title: string;
  description: string;
  actions: React.ReactNode;
}

function ErrorLayout({ icon, code, title, description, actions }: ErrorLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon badge */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
            {icon}
          </div>
        </div>

        {/* Code */}
        <p className="text-7xl font-extrabold text-slate-800 leading-none">{code}</p>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-slate-700">{title}</h1>

        {/* Description */}
        <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">{description}</p>

        {/* Actions */}
        <div className="flex gap-3 justify-center flex-wrap pt-2">{actions}</div>
      </div>
    </div>
  );
}

/* ─── 403 Forbidden ───────────────────────────────────────────────────────── */
export function ForbiddenPage() {
  const navigate = useNavigate();
  return (
    <ErrorLayout
      code="403"
      icon={<ShieldOff className="w-9 h-9 text-amber-500" />}
      title="Access Denied"
      description="You don't have permission to view this page. Contact your administrator if you believe this is an error."
      actions={
        <>
          <button
            id="forbidden-go-back"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
          <Link
            id="forbidden-go-home"
            to="/app"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#714B67] text-white text-sm hover:bg-[#5c3a54] transition-colors"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </>
      }
    />
  );
}

/* ─── 404 Not Found ───────────────────────────────────────────────────────── */
export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <ErrorLayout
      code="404"
      icon={<FileSearch className="w-9 h-9 text-blue-500" />}
      title="Page Not Found"
      description="The page you're looking for doesn't exist or has been moved. Double-check the URL or return to the dashboard."
      actions={
        <>
          <button
            id="notfound-go-back"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
          <Link
            id="notfound-go-home"
            to="/app"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#714B67] text-white text-sm hover:bg-[#5c3a54] transition-colors"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </>
      }
    />
  );
}

/* ─── 500 Server Error ───────────────────────────────────────────────────── */
interface ServerErrorPageProps {
  errorMessage?: string;
  onRetry?: () => void;
}

export function ServerErrorPage({ errorMessage, onRetry }: ServerErrorPageProps = {}) {
  return (
    <ErrorLayout
      code="500"
      icon={<ServerCrash className="w-9 h-9 text-red-500" />}
      title="Something went wrong"
      description={
        errorMessage
          ? `An unexpected error occurred: ${errorMessage}`
          : 'An unexpected server error occurred. The team has been notified. Please try again in a moment.'
      }
      actions={
        <>
          {onRetry && (
            <button
              id="servererror-retry"
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Try again
            </button>
          )}
          <Link
            id="servererror-go-home"
            to="/app"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#714B67] text-white text-sm hover:bg-[#5c3a54] transition-colors"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </>
      }
    />
  );
}

/* ─── Error Boundary ─────────────────────────────────────────────────────── */
interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage?: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console in dev; in production route to monitoring service
    console.error('[ErrorBoundary] Uncaught render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ServerErrorPage
          errorMessage={this.state.errorMessage}
          onRetry={() => this.setState({ hasError: false, errorMessage: undefined })}
        />
      );
    }
    return this.props.children;
  }
}
