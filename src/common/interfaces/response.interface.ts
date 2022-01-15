/**
 * API Response Object
 *
 * success: true => message, data
 * success: false => errorMessage, error
 *
 */
export interface IResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}
