import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  const mockCategoriesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate query parameters to categoriesService.findAll', async () => {
      const mockList = [{ id: 1, name: 'Laptops' }];
      mockCategoriesService.findAll.mockResolvedValue(mockList);

      const query = { search: 'Lap' };
      const result = await controller.findAll(query);
      expect(result).toEqual(mockList);
      expect(mockCategoriesService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a single category by id', async () => {
      const mockCategory = { id: 1, name: 'Monitors' };
      mockCategoriesService.findOne.mockResolvedValue(mockCategory);

      const result = await controller.findOne(1);
      expect(result).toEqual(mockCategory);
      expect(mockCategoriesService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new category via categoriesService.create', async () => {
      const dto = { name: 'Phones', description: 'Mobile devices', active: true };
      const created = { id: 2, ...dto };
      mockCategoriesService.create.mockResolvedValue(created);

      const result = await controller.create(dto);
      expect(result).toEqual(created);
      expect(mockCategoriesService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update a category by id', async () => {
      const dto = { name: 'Smartphones', active: true };
      const updated = { id: 2, ...dto };
      mockCategoriesService.update.mockResolvedValue(updated);

      const result = await controller.update(2, dto);
      expect(result).toEqual(updated);
      expect(mockCategoriesService.update).toHaveBeenCalledWith(2, dto);
    });
  });

  describe('remove', () => {
    it('should delete a category by id', async () => {
      const removed = { id: 2, name: 'Smartphones' };
      mockCategoriesService.remove.mockResolvedValue(removed);

      const result = await controller.remove(2);
      expect(result).toEqual(removed);
      expect(mockCategoriesService.remove).toHaveBeenCalledWith(2);
    });
  });
});
