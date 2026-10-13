import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';

describe('EmployeeController', () => {
  let controller: EmployeeController;

  const mockEmployeeService = {
    findAll: jest.fn().mockResolvedValue({ data: [], meta: {} }),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeController],
      providers: [
        {
          provide: EmployeeService,
          useValue: mockEmployeeService,
        },
      ],
    }).compile();

    controller = module.get<EmployeeController>(EmployeeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate query parameters to employeeService.findAll', async () => {
      const mockEmployees = [{ id: 1, employeeNo: 'EMP-001', firstName: 'Alice' }];
      mockEmployeeService.findAll.mockResolvedValue(mockEmployees);

      const query = { search: 'Alice' };
      const result = await controller.findAll(query);
      expect(result).toEqual(mockEmployees);
      expect(mockEmployeeService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return an employee by id', async () => {
      const mockEmp = { id: 1, employeeNo: 'EMP-001', firstName: 'Alice' };
      mockEmployeeService.findOne.mockResolvedValue(mockEmp);

      const result = await controller.findOne('1');
      expect(result).toEqual(mockEmp);
      expect(mockEmployeeService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new employee record', async () => {
      const dto = {
        employeeNo: 'EMP-002',
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob@company.com',
        department: 'Engineering',
        position: 'Developer',
      };
      const created = { id: 2, ...dto };
      mockEmployeeService.create.mockResolvedValue(created);

      const result = await controller.create(dto);
      expect(result).toEqual(created);
      expect(mockEmployeeService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update an existing employee record', async () => {
      const dto = { position: 'Senior Developer' };
      const updated = { id: 2, position: 'Senior Developer' };
      mockEmployeeService.update.mockResolvedValue(updated);

      const result = await controller.update('2', dto);
      expect(result).toEqual(updated);
      expect(mockEmployeeService.update).toHaveBeenCalledWith(2, dto);
    });
  });

  describe('remove', () => {
    it('should delete or deactivate an employee by id', async () => {
      const removed = { id: 2, deleted: true };
      mockEmployeeService.remove.mockResolvedValue(removed);

      const result = await controller.remove('2');
      expect(result).toEqual(removed);
      expect(mockEmployeeService.remove).toHaveBeenCalledWith(2);
    });
  });
});
