/** Mirrors the backend `ApiResponse<T>` envelope. */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: ApiError;
  timestamp: string;
}

export interface FieldValidationError {
  field: string;
  message: string;
  rejectedValue?: unknown;
}

export interface ApiError {
  code: string;
  status: number;
  path: string;
  fieldErrors?: FieldValidationError[];
}
