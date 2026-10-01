import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;
      
      const errorStr = typeof exceptionResponse === 'object' && exceptionResponse !== null && exceptionResponse.error 
        ? exceptionResponse.error 
        : 'Error';
      const errorSlug = errorStr.toLowerCase().replace(/\s+/g, '-');
      
      const problemDetails: any = {
        type: `https://api.assetflow.local/problems/${errorSlug}`,
        title: errorStr,
        status: status,
        detail: typeof exceptionResponse === 'object' && exceptionResponse !== null && exceptionResponse.message && !Array.isArray(exceptionResponse.message)
          ? exceptionResponse.message
          : exception.message,
        timestamp: new Date().toISOString(),
        path: request.url,
      };

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null && Array.isArray(exceptionResponse.message)) {
        problemDetails.validationErrors = exceptionResponse.message;
        problemDetails.detail = 'Validation failed';
      }

      response.status(status).json(problemDetails);
    } else {
      const status = HttpStatus.INTERNAL_SERVER_ERROR;
      response.status(status).json({
        type: 'https://api.assetflow.local/problems/internal-server-error',
        title: 'Internal Server Error',
        status: status,
        detail: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
