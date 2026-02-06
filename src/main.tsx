import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { ErrorBoundary } from '@/components/ui/error-boundary';

createRoot(document.getElementById("root")!).render(
    <ErrorBoundary fallback={<div className="min-h-screen flex items-center justify-center bg-red-50 text-red-900 p-4">
        <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p>The application encountered a critical error. Please verify your internet connection and try refreshing.</p>
        </div>
    </div>}>
        <App />
    </ErrorBoundary>
);
