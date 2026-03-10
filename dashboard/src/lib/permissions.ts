// Role-based access control for Optalis Dashboard

export type UserRole = 'admin' | 'manager' | 'reviewer' | 'viewer';

export interface User {
  id?: string;
  name: string;
  initials: string;
  email: string;
  role: UserRole;
  facility_id: string | null;
  facility_name: string | null;
}

// Define which routes each role can access
export const rolePermissions: Record<UserRole, string[]> = {
  admin: [
    '/dashboard',
    '/dashboard/applications',
    '/dashboard/beds',
    '/dashboard/decisions',
    '/dashboard/analytics',
    '/dashboard/reports',
    '/dashboard/audit-log',
    '/dashboard/integrations',
    '/dashboard/team',
    '/dashboard/security',
    '/dashboard/settings',
  ],
  manager: [
    '/dashboard',
    '/dashboard/applications',
    '/dashboard/beds',
    '/dashboard/decisions',
    '/dashboard/analytics',
    '/dashboard/reports',
    '/dashboard/audit-log',
    '/dashboard/security',
    '/dashboard/settings',
  ],
  reviewer: [
    '/dashboard',
    '/dashboard/applications',
    '/dashboard/beds',
    '/dashboard/reports',
  ],
  viewer: [
    '/dashboard',
    '/dashboard/applications',
    '/dashboard/beds',
    '/dashboard/reports',
  ],
};

// Check if a user can access a specific route
export function canAccess(role: UserRole, path: string): boolean {
  const allowedPaths = rolePermissions[role];
  
  // Check exact match first
  if (allowedPaths.includes(path)) {
    return true;
  }
  
  // Check if path starts with any allowed path (for nested routes)
  return allowedPaths.some(allowedPath => 
    path.startsWith(allowedPath + '/')
  );
}

// Filter navigation items based on role
export function filterNavigation(
  navigationGroups: Array<{
    name: string;
    items: Array<{ name: string; href: string; icon: string }>;
  }>,
  role: UserRole
) {
  return navigationGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => canAccess(role, item.href))
    }))
    .filter(group => group.items.length > 0);
}

// Get display name for role
export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    admin: 'Administrator',
    manager: 'Manager',
    reviewer: 'Reviewer',
    viewer: 'Viewer',
  };
  return names[role];
}

// Demo users for testing - in production these come from the API
export const demoUsers: Record<string, User> = {
  'admin@optalis.com': {
    name: 'Jennifer Walsh',
    initials: 'JW',
    email: 'admin@optalis.com',
    role: 'admin',
    facility_id: null,
    facility_name: null,
  },
  'manager@optalis.com': {
    name: 'Michael Chen',
    initials: 'MC',
    email: 'manager@optalis.com',
    role: 'manager',
    facility_id: null, // Will be assigned dynamically
    facility_name: null,
  },
  'reviewer@optalis.com': {
    name: 'Sarah Johnson',
    initials: 'SJ',
    email: 'reviewer@optalis.com',
    role: 'reviewer',
    facility_id: null,
    facility_name: null,
  },
};
