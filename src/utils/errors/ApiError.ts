import httpStatusCodes from 'http-status-codes';

export interface APIError {
  code: number;
  message: string;
  codeAsString?: string;
  description?: string;
  documentation?: string;
}

export interface APIErrorResponse extends Omit<APIError, 'codeAsString'> {
  error: string;
}

export default class ApiError {
  public static format({
    code,
    message,
    codeAsString,
    description,
    documentation,
  }: APIError): APIErrorResponse {
    return {
      error: codeAsString || httpStatusCodes.getStatusText(code),
      message,
      code,
      ...(description && { description }),
      ...(documentation && { documentation }),
    };
  }
}
