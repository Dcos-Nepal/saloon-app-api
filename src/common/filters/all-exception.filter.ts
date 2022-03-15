import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger, HttpException } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger: Logger = new Logger('AllExceptionsFilter');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception?.response) {
      exception.response.statusCode = status;
      exception.response.path = request.url;
      exception.response.timestamp = new Date().toISOString();
    } else {
      exception.statusCode = status;
      exception.path = request.url;
      exception.timestamp = new Date().toISOString();
    }

    // Logging stack trace as standard output
    this.logger.warn('Exception: ', JSON.stringify(exception));

    // Sends formatted response to client
    response.status(status).json(exception?.response ?? exception);
  }
}
