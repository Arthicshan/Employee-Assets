import { Role, ALL_ROLES, isValidRole } from './roles.constant';

describe('roles.constant', () => {
  it('should define Role enum with ADMIN, MANAGER, and EMPLOYEE values', () => {
    expect(Role.ADMIN).toBe('ADMIN');
    expect(Role.MANAGER).toBe('MANAGER');
    expect(Role.EMPLOYEE).toBe('EMPLOYEE');
  });

  it('should contain all three roles in ALL_ROLES array', () => {
    expect(ALL_ROLES).toEqual([Role.ADMIN, Role.MANAGER, Role.EMPLOYEE]);
  });

  describe('isValidRole', () => {
    it('should return true for valid roles', () => {
      expect(isValidRole('ADMIN')).toBe(true);
      expect(isValidRole('MANAGER')).toBe(true);
      expect(isValidRole('EMPLOYEE')).toBe(true);
    });

    it('should return false for invalid strings, null, or undefined', () => {
      expect(isValidRole('SUPERADMIN')).toBe(false);
      expect(isValidRole('GUEST')).toBe(false);
      expect(isValidRole('')).toBe(false);
      expect(isValidRole(null)).toBe(false);
      expect(isValidRole(undefined)).toBe(false);
      expect(isValidRole(123)).toBe(false);
    });
  });
});
