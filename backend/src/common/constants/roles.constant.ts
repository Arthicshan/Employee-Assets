export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}

export const ALL_ROLES: Role[] = [Role.ADMIN, Role.MANAGER, Role.EMPLOYEE];

export function isValidRole(value: unknown): value is Role {
  return typeof value === 'string' && ALL_ROLES.includes(value as Role);
}
