import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from '@/app.tsx';
import { AuthStatusScreen } from '@/components/auth-gate';
import { authConfigError, isAuthConfigured, msalInstance } from '@/auth/msal';

const root = document.getElementById('root')!;

function showBootError(message: string) {
    createRoot(root).render(
        <AuthStatusScreen title="Sign-in unavailable" message={message} />
    );
}

async function start() {
    if (!isAuthConfigured) {
        showBootError(authConfigError);
        return;
    }

    try {
        await msalInstance.initialize();
        const result = await msalInstance.handleRedirectPromise();
        const account = result?.account ?? msalInstance.getAllAccounts()[0];
        if (account) {
            msalInstance.setActiveAccount(account);
        }

        createRoot(root).render(
            <StrictMode>
                <App />
            </StrictMode>
        );
    } catch {
        showBootError('Microsoft sign-in could not start. Check the Entra app registration and try again.');
    }
}

start();
