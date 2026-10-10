import { PublicClientApplication, type Configuration } from '@azure/msal-browser';

const tenantId = import.meta.env.TF_TENANT_ID?.trim() ?? '';
const spaClientId = import.meta.env.TF_SPA_CLIENT_ID?.trim() ?? '';
const apiClientId = import.meta.env.TF_API_CLIENT_ID?.trim() ?? '';

export const isAuthConfigured = Boolean(tenantId && spaClientId && apiClientId);

export const authConfigError =
    'Sign-in is not configured. Set TF_TENANT_ID, TF_SPA_CLIENT_ID, and TF_API_CLIENT_ID.';

export const apiScopes = [`api://${apiClientId}/access_as_user`];

const msalConfig: Configuration = {
    auth: {
        clientId: spaClientId || '00000000-0000-0000-0000-000000000000',
        authority: `https://login.microsoftonline.com/${tenantId || 'common'}`,
        redirectUri: window.location.origin,
    },
    cache: {
        cacheLocation: 'sessionStorage',
    },
};

export const msalInstance = new PublicClientApplication(msalConfig);
