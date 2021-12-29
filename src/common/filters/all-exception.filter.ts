import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common'
import { HttpException } from '@nestjs/common'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger: Logger = new Logger('AllExceptionsFilter')

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest()
    const response = ctx.getResponse()

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    // Logging stack trace as standard output
    this.logger.log('Exception: ', exception)

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      exception: exception ? { ...exception } : {}
    })
  }
}
