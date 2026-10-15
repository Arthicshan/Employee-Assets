import { BadRequestException } from '@nestjs/common';
import { listOptions, listResponse } from './list-query';

describe('list-query helpers', () => {
  describe('listOptions', () => {
    const allowedFields = ['id', 'createdAt', 'name', 'status'];

    it('should build default order by createdAt desc and id asc', () => {
      const options = listOptions({}, allowedFields);
      expect(options).toEqual({
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      });
    });

    it('should support custom sort field and ascending order', () => {
      const options = listOptions({ sortBy: 'name', sortOrder: 'asc' }, allowedFields);
      expect(options).toEqual({
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
      });
    });

    it('should throw BadRequestException if unsupported sort field is provided', () => {
      expect(() => listOptions({ sortBy: 'invalidField' }, allowedFields)).toThrow(
        BadRequestException,
      );
    });

    it('should calculate skip and take when page or limit is provided', () => {
      const options = listOptions({ page: 2, limit: 15 }, allowedFields);
      expect(options).toEqual({
        skip: 15,
        take: 15,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      });
    });
  });

  describe('listResponse', () => {
    it('should return plain data array when neither page nor limit is queried', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = listResponse(data, 2, {});
      expect(result).toEqual(data);
    });

    it('should return paginated data with meta when pagination query is present', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = listResponse(data, 25, { page: 2, limit: 10 });
      expect(result).toEqual({
        data,
        meta: {
          total: 25,
          page: 2,
          limit: 10,
          totalPages: 3,
        },
      });
    });
  });
});
