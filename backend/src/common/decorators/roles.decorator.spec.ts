import { Reflector } from '@nestjs/core';
import { Roles, ROLES_KEY } from './roles.decorator';
import { Public, IS_PUBLIC_KEY } from './public.decorator';
import { Role } from '../constants/roles.constant';

describe('Common custom decorators', () => {
  const reflector = new Reflector();

  describe('@Roles()', () => {
    it('should set role metadata on target handler', () => {
      class TestController {
        @Roles(Role.ADMIN, Role.MANAGER)
        testEndpoint() {}
      }

      const instance = new TestController();
      const roles = reflector.get<Role[]>(ROLES_KEY, instance.testEndpoint);
      expect(roles).toEqual([Role.ADMIN, Role.MANAGER]);
    });
  });

  describe('@Public()', () => {
    it('should set isPublic metadata to true on target handler', () => {
      class TestController {
        @Public()
        publicEndpoint() {}
      }

      const instance = new TestController();
      const isPublic = reflector.get<boolean>(IS_PUBLIC_KEY, instance.publicEndpoint);
      expect(isPublic).toBe(true);
    });
  });
});
