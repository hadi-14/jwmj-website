/**
 * Role-based Access Control (RBAC) System
 * Defines roles, permissions, and access levels for the application
 */

export type Role = 'ADMIN' | 'MANAGER' | 'MEMBER' | 'USER';

export interface Permission {
    name: string;
    description: string;
}

export interface RolePermissions {
    [key: string]: Permission[];
}

/**
 * Define all permissions in the system
 */
export const PERMISSIONS = {
    // Admin/Management permissions
    MANAGE_USERS: { name: 'manage_users', description: 'Manage system users' },
    MANAGE_ADMINS: { name: 'manage_admins', description: 'Manage admin users' },
    MANAGE_SETTINGS: { name: 'manage_settings', description: 'Manage system settings' },
    VIEW_AUDIT_LOGS: { name: 'view_audit_logs', description: 'View audit logs' },

    // Manager permissions
    MANAGE_EVENTS: { name: 'manage_events', description: 'Manage events' },
    MANAGE_BUSINESS_ADS: { name: 'manage_business_ads', description: 'Manage business ads' },
    MANAGE_FORMS: { name: 'manage_forms', description: 'Manage forms' },
    VIEW_SUBMISSIONS: { name: 'view_submissions', description: 'View form submissions' },
    MANAGE_MEMBERS: { name: 'manage_members', description: 'Manage members' },

    // Member permissions
    VIEW_EVENTS: { name: 'view_events', description: 'View events' },
    VIEW_BUSINESS_ADS: { name: 'view_business_ads', description: 'View business ads' },
    SUBMIT_FORM: { name: 'submit_form', description: 'Submit forms' },

    // User permissions
    VIEW_PROFILE: { name: 'view_profile', description: 'View own profile' },
} as const;

/**
 * Define role permissions mapping
 * Maps each role to its set of permissions
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    ADMIN: [
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.MANAGE_ADMINS,
        PERMISSIONS.MANAGE_SETTINGS,
        PERMISSIONS.VIEW_AUDIT_LOGS,
        PERMISSIONS.MANAGE_EVENTS,
        PERMISSIONS.MANAGE_BUSINESS_ADS,
        PERMISSIONS.MANAGE_FORMS,
        PERMISSIONS.VIEW_SUBMISSIONS,
        PERMISSIONS.MANAGE_MEMBERS,
        PERMISSIONS.VIEW_EVENTS,
        PERMISSIONS.VIEW_BUSINESS_ADS,
        PERMISSIONS.SUBMIT_FORM,
        PERMISSIONS.VIEW_PROFILE,
    ],
    MANAGER: [
        PERMISSIONS.MANAGE_EVENTS,
        PERMISSIONS.MANAGE_BUSINESS_ADS,
        PERMISSIONS.VIEW_SUBMISSIONS,
        PERMISSIONS.VIEW_EVENTS,
        PERMISSIONS.VIEW_BUSINESS_ADS,
        PERMISSIONS.VIEW_PROFILE,
    ],
    MEMBER: [
        PERMISSIONS.VIEW_EVENTS,
        PERMISSIONS.VIEW_BUSINESS_ADS,
        PERMISSIONS.SUBMIT_FORM,
        PERMISSIONS.VIEW_PROFILE,
    ],
    USER: [
        PERMISSIONS.VIEW_PROFILE,
    ],
};

/**
 * Define access to specific pages by role
 */
export const PAGE_ACCESS: Record<Role, string[]> = {
    ADMIN: [
        '/admin',
        '/admin/members',
        '/admin/events',
        '/admin/business-ads',
        '/admin/form-builder',
        '/admin/submissions',
        '/admin/settings',
        '/admin/audit-logs', // Future page
    ],
    MANAGER: [
        '/admin/events',
        '/admin/business-ads',
        '/admin/submissions',
    ],
    MEMBER: [
        '/member/dashboard', // Future page
        '/events',
        '/business',
    ],
    USER: [
        '/events',
        '/business',
    ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role];
    return permissions.some(p => p.name === permission.name);
}

/**
 * Check if a role has any of the provided permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
    return permissions.some(p => hasPermission(role, p));
}

/**
 * Check if a role has all of the provided permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
    return permissions.every(p => hasPermission(role, p));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
    return ROLE_PERMISSIONS[role];
}

/**
 * Check if a role can access a specific page
 */
export function canAccessPage(role: Role, pathname: string): boolean {
    const allowedPages = PAGE_ACCESS[role];

    // Check exact match
    if (allowedPages.includes(pathname)) {
        return true;
    }

    // Check if pathname starts with any allowed page (for nested routes)
    return allowedPages.some(page => pathname.startsWith(page));
}

/**
 * Get dashboard URL for a role
 */
export function getDashboardUrl(role: Role): string {
    switch (role) {
        case 'ADMIN':
            return '/admin';
        case 'MANAGER':
            return '/admin/events';
        case 'MEMBER':
            return '/member';
        case 'USER':
            return '/';
        default:
            return '/';
    }
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: Role): string {
    const displayNames: Record<Role, string> = {
        ADMIN: 'Admin',
        MANAGER: 'Manager',
        MEMBER: 'Member',
        USER: 'User',
    };
    return displayNames[role];
}

/**
 * Get role color for UI
 */
export function getRoleColor(role: Role): string {
    const colors: Record<Role, string> = {
        ADMIN: 'bg-red-50 text-red-700',
        MANAGER: 'bg-purple-50 text-purple-700',
        MEMBER: 'bg-blue-50 text-blue-700',
        USER: 'bg-gray-50 text-gray-700',
    };
    return colors[role];
}

/**
 * Valid roles for user creation/management
 */
export const VALID_ROLES: Role[] = ['ADMIN', 'MANAGER', 'MEMBER', 'USER'];
