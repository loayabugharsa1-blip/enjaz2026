export type ErrorCode =
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "INTERNAL_ERROR"
  | "DB_ERROR"
  | "NETWORK_ERROR"
  | "QUOTA_EXCEEDED"
  | "INSUFFICIENT_STOCK";

export interface AppErrorPayload {
  code: ErrorCode;
  message: string;
  details?: unknown;
  statusCode: number;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly details: unknown;
  public readonly statusCode: number;

  constructor(code: ErrorCode, message: string, details?: unknown, statusCode?: number) {
    const statusMap: Record<ErrorCode, number> = {
      NOT_FOUND: 404,
      VALIDATION_ERROR: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      CONFLICT: 409,
      INTERNAL_ERROR: 500,
      DB_ERROR: 500,
      NETWORK_ERROR: 502,
      QUOTA_EXCEEDED: 429,
      INSUFFICIENT_STOCK: 400,
    };
    super(message);
    this.name = "AppError";
    this.code = code;
    this.details = details;
    this.statusCode = statusCode ?? statusMap[code] ?? 500;
  }

  toJSON(): AppErrorPayload {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      statusCode: this.statusCode,
    };
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id?: string) {
    super("NOT_FOUND", id ? `${entity} برقم ${id} غير موجود` : `${entity} غير موجود`);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super("VALIDATION_ERROR", message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "تسجيل الدخول مطلوب") {
    super("UNAUTHORIZED", message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "ليس لديك صلاحية للقيام بهذا الإجراء") {
    super("FORBIDDEN", message);
  }
}

export class InsufficientStockError extends AppError {
  constructor(itemName: string, available: number, requested: number) {
    super("INSUFFICIENT_STOCK", `الكمية غير كافية لـ "${itemName}" (المتوفر: ${available}، المطلوب: ${requested})`);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super("CONFLICT", message);
  }
}

export function handleAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof Error) {
    if (error.message.includes("duplicate key")) {
      return new ConflictError("البيانات موجودة مسبقاً");
    }
    if (error.message.includes("not found")) {
      return new NotFoundError(error.message);
    }
    return new AppError("INTERNAL_ERROR", error.message);
  }
  return new AppError("INTERNAL_ERROR", "حدث خطأ غير متوقع");
}

export function formatErrorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "حدث خطأ غير متوقع";
}

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: AppErrorPayload };
