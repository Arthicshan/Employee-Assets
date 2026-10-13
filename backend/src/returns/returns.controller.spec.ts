import { Test, TestingModule } from '@nestjs/testing';
import { ReturnsController } from './returns.controller';
import { ReturnsService } from './returns.service';

describe('ReturnsController', () => {
  let controller: ReturnsController;

  const mockReturnsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReturnsController],
      providers: [
        {
          provide: ReturnsService,
          useValue: mockReturnsService,
        },
      ],
    }).compile();

    controller = module.get<ReturnsController>(ReturnsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should process an asset return with GOOD condition', async () => {
      const dto = {
        assignmentId: 10,
        condition: 'GOOD',
        notes: 'Returned with original charger',
      };
      const expectedResult = {
        id: 10,
        status: 'RETURNED',
        returnCondition: 'GOOD',
      };
      mockReturnsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(dto);
      expect(result).toEqual(expectedResult);
      expect(mockReturnsService.create).toHaveBeenCalledWith(dto);
    });

    it('should process an asset return with DAMAGED condition', async () => {
      const dto = {
        assignmentId: 11,
        condition: 'DAMAGED',
        notes: 'Cracked display panel',
      };
      const expectedResult = {
        id: 11,
        status: 'RETURNED',
        returnCondition: 'DAMAGED',
      };
      mockReturnsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(dto);
      expect(result).toEqual(expectedResult);
      expect(mockReturnsService.create).toHaveBeenCalledWith(dto);
    });
  });
});
