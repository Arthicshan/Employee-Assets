import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const code = (exception as { code?: string })?.code;
    if (code === 'P2002' || code === 'P2003' || code === 'P2025' || code === 'P2034') {
      const status = code === 'P2025' ? 404 : 409;
      exception = new HttpException({ error: status === 404 ? 'Not Found' : 'Conflict', message:
        code === 'P2002' ? 'A record with this unique code, email, serial number or active assignment already exists' :
        code === 'P2003' ? 'This record is referenced by other records and cannot be deleted' :
        code === 'P2034' ? 'A concurrent operation changed this record. Refresh and try again' : 'Record not found' }, status);
    }
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
