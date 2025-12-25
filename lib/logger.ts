type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDevelopment = process.env.NODE_ENV === 'development';

interface LogContext {
  [key: string]: unknown;
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

export const logger = {
  debug: (message: string, context?: LogContext) => {
    if (isDevelopment) {
      console.debug(formatMessage('debug', message, context));
    }
  },

  info: (message: string, context?: LogContext) => {
    console.info(formatMessage('info', message, context));
  },

  warn: (message: string, context?: LogContext) => {
    console.warn(formatMessage('warn', message, context));
  },

  error: (message: string, error?: unknown, context?: LogContext) => {
    const errorContext = {
      ...context,
      ...(error instanceof Error
        ? { errorMessage: error.message, stack: error.stack }
        : { error }),
    };
    console.error(formatMessage('error', message, errorContext));
  },
};

// API 에러 응답 헬퍼
export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

export function createApiError(
  message: string,
  code?: string,
  details?: unknown
): ApiError {
  const result: ApiError = { error: message };
  if (code) result.code = code;
  if (details) result.details = details;
  return result;
}

// 공통 에러 메시지
export const ErrorMessages = {
  UNAUTHORIZED: '인증이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  VALIDATION_ERROR: '입력값이 올바르지 않습니다.',
  INTERNAL_ERROR: '서버 오류가 발생했습니다.',

  // 엔티티별 에러
  VEHICLE_NOT_FOUND: '차량을 찾을 수 없습니다.',
  BRAND_NOT_FOUND: '브랜드를 찾을 수 없습니다.',
  FAQ_NOT_FOUND: 'FAQ를 찾을 수 없습니다.',
  BANNER_NOT_FOUND: '배너를 찾을 수 없습니다.',
  PARTNER_NOT_FOUND: '제휴사를 찾을 수 없습니다.',

  // 작업별 에러
  CREATE_FAILED: '등록에 실패했습니다.',
  UPDATE_FAILED: '수정에 실패했습니다.',
  DELETE_FAILED: '삭제에 실패했습니다.',
  UPLOAD_FAILED: '업로드에 실패했습니다.',
} as const;
