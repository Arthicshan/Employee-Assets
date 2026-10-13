import { Test, TestingModule } from '@nestjs/testing';
import { EmployeePortalController } from './employee-portal.controller';
import { EmployeePortalService } from './employee-portal.service';

describe('EmployeePortalController', () => {
  let controller: EmployeePortalController;

  const mockPortalService = {
    getMyDashboard: jest.fn(),
    getProfile: jest.fn(),
    getMyAssets: jest.fn(),
    getMyAssignments: jest.fn(),
    getMyHistory: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeePortalController],
      providers: [
        {
          provide: EmployeePortalService,
          useValue: mockPortalService,
        },
      ],
    }).compile();

    controller = module.get<EmployeePortalController>(EmployeePortalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyDashboard', () => {
    it('should return dashboard overview for authenticated employee', async () => {
      const mockDashboard = { assignedAssetsCount: 2, activeAssignments: [] };
      mockPortalService.getMyDashboard.mockResolvedValue(mockDashboard);

      const req = { user: { id: 3, employeeId: 10 } };
      const result = await controller.getMyDashboard(req);
      expect(result).toEqual(mockDashboard);
      expect(mockPortalService.getMyDashboard).toHaveBeenCalledWith(3, 10);
    });
  });

  describe('getMyProfile', () => {
    it('should return employee profile information', async () => {
      const mockProfile = { id: 10, employeeNo: 'EMP-010', firstName: 'Alice' };
      mockPortalService.getProfile.mockResolvedValue(mockProfile);

      const req = { user: { id: 3, employeeId: 10 } };
      const result = await controller.getMyProfile(req);
      expect(result).toEqual(mockProfile);
      expect(mockPortalService.getProfile).toHaveBeenCalledWith(3, 10);
    });
  });

  describe('getMyAssets', () => {
    it('should return currently assigned assets for authenticated employee', async () => {
      const mockAssets = [{ id: 1, assetTag: 'LAP-001', name: 'MacBook Pro' }];
      mockPortalService.getMyAssets.mockResolvedValue(mockAssets);

      const req = { user: { id: 3, employeeId: 10 } };
      const result = await controller.getMyAssets(req);
      expect(result).toEqual(mockAssets);
      expect(mockPortalService.getMyAssets).toHaveBeenCalledWith(3, 10);
    });
  });

  describe('getMyAssignments', () => {
    it('should return assignment history records for authenticated employee', async () => {
      const mockAssignments = [{ id: 5, assetId: 1, status: 'ACTIVE' }];
      mockPortalService.getMyAssignments.mockResolvedValue(mockAssignments);

      const req = { user: { id: 3, employeeId: 10 } };
      const result = await controller.getMyAssignments(req);
      expect(result).toEqual(mockAssignments);
      expect(mockPortalService.getMyAssignments).toHaveBeenCalledWith(3, 10);
    });
  });

  describe('getMyHistory', () => {
    it('should return lifecycle audit history for authenticated employee', async () => {
      const mockHistory = [{ id: 12, action: 'ASSIGNED', assetId: 1 }];
      mockPortalService.getMyHistory.mockResolvedValue(mockHistory);

      const req = { user: { id: 3, employeeId: 10 } };
      const result = await controller.getMyHistory(req);
      expect(result).toEqual(mockHistory);
      expect(mockPortalService.getMyHistory).toHaveBeenCalledWith(3, 10);
    });
  });
});
