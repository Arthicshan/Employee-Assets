import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';

describe('AssignmentsController', () => {
  let controller: AssignmentsController;

  const mockAssignmentsService = {
    findAll: jest.fn().mockResolvedValue({ data: [], meta: {} }),
    findOne: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignmentsController],
      providers: [
        {
          provide: AssignmentsService,
          useValue: mockAssignmentsService,
        },
      ],
    }).compile();

    controller = module.get<AssignmentsController>(AssignmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated assignments matching query parameters', async () => {
      const mockResponse = {
        data: [{ id: 1, assetId: 10, employeeId: 2, status: 'ACTIVE' }],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };
      mockAssignmentsService.findAll.mockResolvedValue(mockResponse);

      const query = { status: 'ACTIVE', page: 1 };
      const result = await controller.findAll(query);
      expect(result).toEqual(mockResponse);
      expect(mockAssignmentsService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return assignment details by id', async () => {
      const assignment = { id: 5, assetId: 10, employeeId: 2, status: 'ACTIVE' };
      mockAssignmentsService.findOne.mockResolvedValue(assignment);

      const result = await controller.findOne('5');
      expect(result).toEqual(assignment);
      expect(mockAssignmentsService.findOne).toHaveBeenCalledWith(5);
    });
  });

  describe('create', () => {
    it('should assign an available asset to an employee', async () => {
      const dto = { assetId: 10, employeeId: 2, notes: 'Issued for field work' };
      const created = { id: 6, ...dto, status: 'ACTIVE' };
      mockAssignmentsService.create.mockResolvedValue(created);

      const result = await controller.create(dto);
      expect(result).toEqual(created);
      expect(mockAssignmentsService.create).toHaveBeenCalledWith(dto);
    });
  });
});
