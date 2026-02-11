import { UserRole } from './constants';

/**
 * Represents an organization with optional children (for hierarchy resolution).
 */
export interface OrgWithChildren {
  id: string;
  parentId: string | null;
  children?: OrgWithChildren[];
}

/** Minimal user shape for org scope (role + organizationId). */
export interface UserForScope {
  role: UserRole;
  organizationId: string;
}

/**
 * Given a user and their organization tree, return the org IDs the user can access.
 * - Owner at parent: parent + all descendant org IDs
 * - Owner at child: that org only (no children in 2-level model)
 * - Admin/Viewer: their org only
 */
export function getAccessibleOrgIds(
  user: UserForScope,
  userOrg: OrgWithChildren
): string[] {
  if (user.role === UserRole.OWNER) {
    return flattenOrgIds(userOrg);
  }
  return [user.organizationId];
}

function flattenOrgIds(org: OrgWithChildren): string[] {
  const ids = [org.id];
  if (org.children?.length) {
    org.children.forEach((c) => ids.push(...flattenOrgIds(c)));
  }
  return ids;
}
