import { useEffect, useState, type ReactNode } from 'react';
import { useMsal } from '@azure/msal-react';
import { useQuery } from '@tanstack/react-query';
import { LogIn, ShieldAlert } from 'lucide-react';
import { apiScopes } from '@/auth/msal';
import { ApiError, apiFetch } from '@/auth/api';
import { Button } from '@/components/ui/button';

function AuthShell({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
            <div className="w-full max-w-md rounded-2xl glass-card p-8 text-center">
                {children}
            </div>
        </div>
    );
}

export function SignInScreen() {
    const { instance } = useMsal();
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    const signIn = async () => {
        setError(null);
        setPending(true);
        try {
            await instance.loginRedirect({ scopes: apiScopes });
        } catch (err) {
            setPending(false);
            const message = err instanceof Error ? err.message : 'Sign-in failed.';
            setError(message.includes('eyJ') ? 'Sign-in failed.' : message);
        }
    };

    return (
        <AuthShell>
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <LogIn className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold">TalentForge</h1>
            <p className="mt-2 text-sm text-muted-foreground">
                Sign in with your Microsoft work account to continue.
            </p>
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
            <Button className="mt-6 w-full" onClick={signIn} disabled={pending}>
                {pending ? 'Redirecting…' : 'Sign in with Microsoft'}
            </Button>
        </AuthShell>
    );
}

export function AuthStatusScreen({ title, message }: { title: string; message: string }) {
    return (
        <AuthShell>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="mt-3 text-sm text-muted-foreground">{message}</p>
        </AuthShell>
    );
}

export function AccessDeniedScreen() {
    const { instance } = useMsal();

    return (
        <AuthShell>
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
                <ShieldAlert className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold">Access denied</h1>
            <p className="mt-2 text-sm text-muted-foreground">
                Your account signed in, but it is not allowed to use TalentForge.
            </p>
            <Button
                className="mt-6"
                variant="outline"
                onClick={() => instance.logoutRedirect({ account: instance.getActiveAccount() ?? undefined })}
            >
                Sign out
            </Button>
        </AuthShell>
    );
}

export function SessionGate({ children }: { children: ReactNode }) {
    const [forbidden, setForbidden] = useState(false);

    useEffect(() => {
        const onForbidden = () => setForbidden(true);
        window.addEventListener('talentforge:forbidden', onForbidden);
        return () => window.removeEventListener('talentforge:forbidden', onForbidden);
    }, []);

    const me = useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            const response = await apiFetch('/me');
            return response.json();
        },
        retry: false,
    });

    if (forbidden || (me.error instanceof ApiError && me.error.status === 403)) {
        return <AccessDeniedScreen />;
    }

    if (me.isPending) {
        return <AuthStatusScreen title="Checking your access" message="Confirming your Microsoft account with TalentForge." />;
    }

    if (me.error) {
        const message = me.error instanceof ApiError
            ? me.error.message
            : 'TalentForge could not verify your account. Sign in again.';
        return <AuthStatusScreen title="Sign-in problem" message={message} />;
    }

    return children;
}
