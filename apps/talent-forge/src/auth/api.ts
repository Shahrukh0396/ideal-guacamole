import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { apiScopes, msalInstance } from '@/auth/msal';

const API_BASE = (import.meta.env.TF_API_BASE || '').replace(/\/$/, '');

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

function resolveUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const suffix = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE}${suffix}`;
}

async function accessToken(): Promise<string> {
    const account = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];
    if (!account) {
        await msalInstance.loginRedirect({ scopes: apiScopes });
        throw new ApiError('Sign in required.', 401);
    }

    try {
        const result = await msalInstance.acquireTokenSilent({ account, scopes: apiScopes });
        return result.accessToken;
    } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
            await msalInstance.acquireTokenRedirect({ account, scopes: apiScopes });
            throw new ApiError('Sign in required.', 401);
        }
        throw error;
    }
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
    const token = await accessToken();
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);

    const response = await fetch(resolveUrl(path), { ...options, headers });

    if (response.status === 401) {
        throw new ApiError('Your session has expired or the token is invalid. Sign in again.', 401);
    }

    if (response.status === 403) {
        window.dispatchEvent(new CustomEvent('talentforge:forbidden'));
        throw new ApiError('Access denied. You do not have permission to use TalentForge.', 403);
    }

    return response;
}
