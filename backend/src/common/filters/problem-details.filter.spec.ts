import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { ProblemDetailsFilter } from './problem-details.filter';

describe('ProblemDetailsFilter', () => {
  let filter: ProblemDetailsFilter;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSetHeader: jest.Mock;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new ProblemDetailsFilter();
    mockJson = jest.fn();
    mockSetHeader = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnValue({
      setHeader: mockSetHeader,
      json: mockJson,
    });

    const mockRequest = { url: '/api/test-endpoint' };
    const mockResponse = {
      status: mockStatus,
      setHeader: mockSetHeader,
      json: mockJson,
    };

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should transform HttpException into RFC 7807 problem details json', () => {
    const exception = new HttpException('Resource not found', HttpStatus.NOT_FOUND);

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockSetHeader).toHaveBeenCalledWith('Content-Type', 'application/problem+json');
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('/problems/'),
        status: 404,
        detail: 'Resource not found',
        path: '/api/test-endpoint',
      }),
    );
  });

  it('should format validation errors array properly in problem details', () => {
    const exception = new HttpException(
      { message: ['Name is required', 'Email is invalid'], error: 'Bad Request' },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
        detail: 'Validation failed',
        validationErrors: ['Name is required', 'Email is invalid'],
      }),
    );
  });

  it('should map Prisma unique constraint violation (P2002) to 409 Conflict', () => {
    const prismaError = { code: 'P2002' };

    filter.catch(prismaError, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(409);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 409,
        detail: 'A record with this unique code, email, serial number or active assignment already exists',
      }),
    );
  });

  it('should map unknown unexpected errors to 500 Internal Server Error', () => {
    const unknownError = new Error('Database connection dropped unexpectedly');

    filter.catch(unknownError, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'https://api.assetflow.local/problems/internal-server-error',
        title: 'Internal Server Error',
        status: 500,
        detail: 'An unexpected error occurred',
      }),
    );
  });
});
