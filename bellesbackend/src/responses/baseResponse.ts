export interface IBaseResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface ISuccessResponse<T = any> extends IBaseResponse {
  success: true;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IErrorResponse extends IBaseResponse {
  success: false;
  error: {
    code: string;
    details?: any;
  };
}

export class BaseResponse {
  static success<T>(
    message: string,
    data?: T,
    pagination?: ISuccessResponse<T>['pagination']
  ): ISuccessResponse<T> {
    return {
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString()
    };
  }

  static error(message: string, errorCode: string, details?: any): IErrorResponse {
    return {
      success: false,
      message,
      error: {
        code: errorCode,
        details
      },
      timestamp: new Date().toISOString()
    };
  }
}
