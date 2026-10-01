import { ProblemDetails } from '@/types';

export class ApiError extends Error {
  public status: number;
  public problemDetails?: ProblemDetails;
  public validationErrors?: string[];

  constructor(status: number, message: string, problemDetails?: ProblemDetails) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.problemDetails = problemDetails;
    this.validationErrors = problemDetails?.validationErrors;
  }
}

