import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';
import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';

import Layout from '@/pages/_layout';
import { queryClient } from '@/lib/query-client';
import { Toaster } from '@/components/ui/sonner';
import ErrorBoundary from '@/components/system/error-boundary';
import { SessionGate, SignInScreen } from '@/components/auth-gate';
import { msalInstance } from '@/auth/msal';

import HomePage from '@/pages/index';
import HistoryPage from '@/pages/history';
import NotFoundPage from '@/pages/not-found';

function Product() {
    return (
        <ErrorBoundary resetQueryCache>
            <JotaiProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<HomePage />} />
                            <Route path="history" element={<HistoryPage />} />
                            <Route path="*" element={<NotFoundPage />} />
                        </Route>
                    </Routes>
                </Router>
            </JotaiProvider>
        </ErrorBoundary>
    );
}

function App() {
    return (
        <MsalProvider instance={msalInstance}>
            <QueryClientProvider client={queryClient}>
                <Toaster richColors />
                <UnauthenticatedTemplate>
                    <SignInScreen />
                </UnauthenticatedTemplate>
                <AuthenticatedTemplate>
                    <SessionGate>
                        <Product />
                    </SessionGate>
                </AuthenticatedTemplate>
            </QueryClientProvider>
        </MsalProvider>
    );
}

export default App;
