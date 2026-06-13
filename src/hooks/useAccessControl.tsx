/**
 * React hook for role-based access control
 * Helps components check if the current user has required permissions
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { canAccessPage, getDashboardUrl, hasPermission, PERMISSIONS, Permission } from '@/lib/roles';

interface UseAccessControlOptions {
    requiredPermission?: Permission;
    requiredPath?: string;
    fallbackUrl?: string;
    redirectOnUnauthorized?: boolean;
}

export function useAccessControl(options: UseAccessControlOptions = {}) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        async function checkAccess() {
            try {
                // Fetch current user info from auth session
                const response = await fetch('/api/auth/session', {
                    credentials: 'include',
                });

                if (!response.ok) {
                    if (options.redirectOnUnauthorized !== false) {
                        router.push('/admin/login');
                    }
                    setIsAuthorized(false);
                    return;
                }

                const data = await response.json();
                const role = data.user?.role;

                if (!role) {
                    setIsAuthorized(false);
                    return;
                }

                setUserRole(role);

                // Check permission if required
                if (options.requiredPermission) {
                    if (!hasPermission(role, options.requiredPermission)) {
                        setIsAuthorized(false);
                        if (options.redirectOnUnauthorized !== false) {
                            router.push(options.fallbackUrl || getDashboardUrl(role));
                        }
                        return;
                    }
                }

                // Check page access if required
                if (options.requiredPath) {
                    if (!canAccessPage(role, options.requiredPath)) {
                        setIsAuthorized(false);
                        if (options.redirectOnUnauthorized !== false) {
                            router.push(options.fallbackUrl || getDashboardUrl(role));
                        }
                        return;
                    }
                }

                setIsAuthorized(true);
            } finally {
                setIsLoading(false);
            }
        }

        checkAccess();
    }, [options, router]);

    return {
        isAuthorized,
        isLoading,
        userRole,
    };
}

/**
 * Check if user has specific permission
 */
export function usePermission(permission: Permission) {
    const [hasAccess, setHasAccess] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function checkPermission() {
            try {
                const response = await fetch('/api/auth/session', {
                    credentials: 'include',
                });

                if (!response.ok) {
                    setHasAccess(false);
                    return;
                }

                const data = await response.json();
                const role = data.user?.role;
                setHasAccess(role ? hasPermission(role, permission) : false);
            } finally {
                setIsLoading(false);
            }
        }

        checkPermission();
    }, [permission]);

    return { hasAccess, isLoading };
}

/**
 * Protect a component with role-based access
 */
export function withRoleProtection<P extends object>(
    Component: React.ComponentType<P>,
    requiredPermission?: Permission
) {
    return function ProtectedComponent(props: P) {
        const { hasAccess, isLoading } = usePermission(
            requiredPermission || PERMISSIONS.VIEW_PROFILE
        );

        if (isLoading) {
            return <div className="flex items-center justify-center p-8">Loading...</div>;
        }

        if (!hasAccess) {
            return <div className="flex items-center justify-center p-8">Access Denied</div>;
        }

        return <Component {...props} />;
    };
}
