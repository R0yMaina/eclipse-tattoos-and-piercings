import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { ErrorBoundary } from '@/components/ui/error-boundary';
import { installGlobalErrorHandlers, reportClientError } from '@/lib/errorReporter';

installGlobalErrorHandlers();

createRoot(document.getElementById("root")!).render(
    <ErrorBoundary
        fallback={
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
                <div className="max-w-md text-center space-y-4">
                    <h1 className="text-2xl font-heading font-semibold">Something went wrong</h1>
                    <p className="text-muted-foreground">
                        We've been notified. Please refresh the page or try again in a moment.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth"
                    >
                        Reload
                    </button>
                </div>
            </div>
        }
        onError={(err, info) => reportClientError(err.message, err.stack, { componentStack: info?.componentStack })}
    >
        <App />
    </ErrorBoundary>
);
