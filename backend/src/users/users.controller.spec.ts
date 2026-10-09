import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    toggleStatus: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call usersService.findAll with query parameters', async () => {
      const mockResult = [{ id: 1, email: 'admin@company.com' }];
      mockUsersService.findAll.mockResolvedValue(mockResult);

      const query = { search: 'admin' };
      const result = await controller.findAll(query);
      expect(result).toEqual(mockResult);
      expect(mockUsersService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should call usersService.findOne with id', async () => {
      const mockUser = { id: 1, email: 'admin@company.com' };
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(1);
      expect(result).toEqual(mockUser);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should call usersService.create with dto', async () => {
      const dto = {
        email: 'new@company.com',
        firstName: 'Jane',
        lastName: 'Doe',
      };
      const createdUser = { id: 2, ...dto };
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await controller.create(dto);
      expect(result).toEqual(createdUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should call usersService.update with id and dto', async () => {
      const dto = { firstName: 'Updated' };
      const updatedUser = { id: 1, firstName: 'Updated' };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(1, dto);
      expect(result).toEqual(updatedUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('toggleStatus', () => {
    it('should call usersService.toggleStatus with id', async () => {
      const updatedUser = { id: 2, isActive: false };
      mockUsersService.toggleStatus.mockResolvedValue(updatedUser);

      const result = await controller.toggleStatus(2);
      expect(result).toEqual(updatedUser);
      expect(mockUsersService.toggleStatus).toHaveBeenCalledWith(2);
    });
  });

  describe('remove', () => {
    it('should call usersService.remove with id and current user id', async () => {
      mockUsersService.remove.mockResolvedValue({ id: 2, deleted: true });

      const req = { user: { id: 1 } };
      const result = await controller.remove(2, req);
      expect(result).toEqual({ id: 2, deleted: true });
      expect(mockUsersService.remove).toHaveBeenCalledWith(2, 1);
    });
  });
});
