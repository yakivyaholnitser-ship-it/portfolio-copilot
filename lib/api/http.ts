import { NextResponse } from "next/server";

import type { ApiErrorResponse, ApiSuccessResponse } from "@/types/api";

export function ok<TData>(data: TData, init?: ResponseInit) {
  return NextResponse.json<ApiSuccessResponse<TData>>({ data }, init);
}

export function apiError(
  code: string,
  message: string,
  init: ResponseInit = { status: 400 },
) {
  return NextResponse.json<ApiErrorResponse>(
    {
      error: {
        code,
        message,
      },
    },
    init,
  );
}
