import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

/* eslint-disable @typescript-eslint/no-empty-interface */
export interface RequestConfig extends AxiosRequestConfig {}
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Response<T = any> extends AxiosResponse<T> {}
/* eslint-disable @typescript-eslint/no-empty-interface */
export interface ResponseError<T = any> extends AxiosError<T> {}

export class Request {
  constructor(private request = axios) {}

  public get<T>(url: string, config: RequestConfig = {}): Promise<Response<T>> {
    return this.request.get<T, Response<T>>(url, config);
  }

  public static isRequestResponse(error: ResponseError): boolean {
    return !!(error.response && error.response?.status);
  }
}
