import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should authenticate user and return JWT access token payload', async () => {
      const loginDto = { email: 'admin@assetflow.com', password: 'admin123' };
      const authResponse = {
        accessToken: 'mock-jwt-token',
        user: {
          id: 1,
          email: 'admin@assetflow.com',
          firstName: 'System',
          lastName: 'Admin',
          role: 'ADMIN',
        },
      };
      mockAuthService.login.mockResolvedValue(authResponse);

      const result = await controller.login(loginDto);
      expect(result).toEqual(authResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('getProfile', () => {
    it('should return the authenticated user from request context', () => {
      const mockUser = {
        id: 1,
        email: 'admin@assetflow.com',
        role: 'ADMIN',
      };
      const req = { user: mockUser };

      const result = controller.getProfile(req);
      expect(result).toEqual(mockUser);
    });
  });
});

