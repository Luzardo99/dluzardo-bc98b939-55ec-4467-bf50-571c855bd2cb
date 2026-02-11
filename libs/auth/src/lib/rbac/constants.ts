/**
 * Role values - must match @dluzardo-bc98b939-55ec-4467-bf50-571c855bd2cb/data UserRole enum.
 * Defined here to avoid auth lib depending on data lib (avoids rootDir/build issues).
 */
export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  VIEWER = 'viewer',
}

/** Role hierarchy (strongest to weakest). Higher index = weaker role. */
export const ROLE_HIERARCHY: UserRole[] = [UserRole.OWNER, UserRole.ADMIN, UserRole.VIEWER];

/** Check if userRole is at least as powerful as requiredRole (role inheritance). */
export function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const userLevel = ROLE_HIERARCHY.indexOf(userRole);
  const requiredLevel = ROLE_HIERARCHY.indexOf(requiredRole);
  return userLevel >= 0 && requiredLevel >= 0 && userLevel <= requiredLevel;
}

/** Check if user has any of the allowed roles. */
export function hasAnyRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.some((r) => hasMinimumRole(userRole, r));
}
