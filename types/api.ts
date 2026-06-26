export interface ApiErrorResponse {
  readonly error: {
    readonly code: string;
    readonly message: string;
  };
}

export interface ApiSuccessResponse<TData> {
  readonly data: TData;
}

export type ApiResponse<TData> = ApiSuccessResponse<TData> | ApiErrorResponse;
