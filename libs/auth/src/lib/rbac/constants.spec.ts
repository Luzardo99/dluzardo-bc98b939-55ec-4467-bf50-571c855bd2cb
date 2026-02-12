import { UserRole, hasMinimumRole, hasAnyRole } from './constants';

describe('RBAC constants', () => {
  describe('hasMinimumRole', () => {
    it('Owner satisfies Admin and Viewer', () => {
      expect(hasMinimumRole(UserRole.OWNER, UserRole.ADMIN)).toBe(true);
      expect(hasMinimumRole(UserRole.OWNER, UserRole.VIEWER)).toBe(true);
    });
    it('Admin satisfies Viewer but not Owner', () => {
      expect(hasMinimumRole(UserRole.ADMIN, UserRole.VIEWER)).toBe(true);
      expect(hasMinimumRole(UserRole.ADMIN, UserRole.OWNER)).toBe(false);
    });
    it('Viewer satisfies only Viewer', () => {
      expect(hasMinimumRole(UserRole.VIEWER, UserRole.VIEWER)).toBe(true);
      expect(hasMinimumRole(UserRole.VIEWER, UserRole.ADMIN)).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('returns true when user has one of allowed roles', () => {
      expect(hasAnyRole(UserRole.ADMIN, [UserRole.OWNER, UserRole.ADMIN])).toBe(true);
    });
    it('returns false when user has none', () => {
      expect(hasAnyRole(UserRole.VIEWER, [UserRole.OWNER, UserRole.ADMIN])).toBe(false);
    });
  });
});
