/**
 * Error-related type definitions
 */

export interface ErrorDetail {
  field: string;
  message: string;
  code: string;
}

export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  requestId?: string;
  timestamp: string;
  errors?: ErrorDetail[];
}
