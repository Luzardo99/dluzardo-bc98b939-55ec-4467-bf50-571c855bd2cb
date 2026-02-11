import { SetMetadata } from '@nestjs/common';
import { UserRole } from './constants';

export const ROLES_KEY = 'roles';

/**
 * Restrict endpoint to users with at least one of the given roles.
 * Uses role inheritance: Owner satisfies Admin, Admin satisfies Viewer.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
