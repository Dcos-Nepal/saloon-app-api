import { IResponse } from '../interfaces/response.interface';

/**
 * Error Response
 * success: true => message, data
 */
export class ResponseError implements IResponse {
  success: boolean;
  message: string;
  error: any;

  constructor(message: string, error?: any) {
    this.success = false;
    this.message = message;
    this.error = error;

    console.warn(new Date().toString() + ' - [Response]: ' + message + (error ? ' - ' + JSON.stringify(error) : ''));
  }
}

/**
 * Success Response
 * success: false => errorMessage, error
 */
export class ResponseSuccess implements IResponse {
  success: boolean;
  message: string;
  data: any;

  constructor(message: string, data?: any, notLog?: boolean) {
    this.success = true;
    this.message = message;
    this.data = data;

    if (!notLog) {
      try {
        const offuscateRequest = JSON.parse(JSON.stringify(data));
        if (offuscateRequest && offuscateRequest.token) offuscateRequest.token = '*******';
        console.log(new Date().toString() + ' - [Response]: ' + JSON.stringify(offuscateRequest));
      } catch (error) {
        console.log('Error parsing the data from API');
      }
    }
  }
}
