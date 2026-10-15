import { ExecutionContext } from '@nestjs/common';
import { CurrentUser } from './current-user.decorator';

// NestJS internal key for route argument metadata
const ROUTE_ARGS_METADATA = '__routeArguments__';

function getParamDecoratorFactory() {
  class TestController {
    testEndpoint(@CurrentUser() _user: unknown) {}
  }
  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestController, 'testEndpoint');
  return args[Object.keys(args)[0]].factory;
}

function createMockContext(userPayload: Record<string, unknown> | undefined): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user: userPayload,
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('CurrentUser decorator', () => {
  const factory = getParamDecoratorFactory();

  it('should return the full user object when no specific key is provided', () => {
    const mockUser = { id: 'usr-1', email: 'admin@bpo.com', role: 'ADMIN' };
    const ctx = createMockContext(mockUser);

    const result = factory(undefined, ctx);
    expect(result).toEqual(mockUser);
  });

  it('should return a specific property from the user object when key is provided', () => {
    const mockUser = { id: 'usr-1', email: 'admin@bpo.com', role: 'ADMIN' };
    const ctx = createMockContext(mockUser);

    expect(factory('id', ctx)).toBe('usr-1');
    expect(factory('email', ctx)).toBe('admin@bpo.com');
    expect(factory('role', ctx)).toBe('ADMIN');
  });

  it('should return undefined when requesting a nonexistent field on user object', () => {
    const mockUser = { id: 'usr-1' };
    const ctx = createMockContext(mockUser);

    expect(factory('nonExistentField', ctx)).toBeUndefined();
  });

  it('should return undefined if user object is not present on request', () => {
    const ctx = createMockContext(undefined);

    expect(factory(undefined, ctx)).toBeUndefined();
    expect(factory('id', ctx)).toBeUndefined();
  });
});
