export type ApiSuccessResponse<T> = {
  ok: true;
  data: T;
};

export type ApiErrorResponse = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function createSuccessResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    ok: true,
    data,
  };
}

export function createErrorResponse(code: string, message: string): ApiErrorResponse {
  return {
    ok: false,
    error: {
      code,
      message,
    },
  };
}

export function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.ok === true;
}
