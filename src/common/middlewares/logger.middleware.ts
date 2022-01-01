import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger: Logger = new Logger('LoggerMiddleware');

  use(req: any, res: Response, next: any) {
    try {
      const offuscateRequest = JSON.parse(JSON.stringify(req.body));

      if (offuscateRequest && offuscateRequest.password) {
        offuscateRequest.password = '*******';
      }

      if (offuscateRequest && offuscateRequest.newPassword) {
        offuscateRequest.newPassword = '*******';
      }

      if (offuscateRequest && offuscateRequest.currentPassword) {
        offuscateRequest.currentPassword = '*******';
      }

      if (offuscateRequest != {}) {
        this.logger.log(new Date().toString() + ' - [Request] ' + req.baseUrl + ' - ' + JSON.stringify(offuscateRequest));
      }
    } catch (error) {
      this.logger.log(new Date().toString() + ' - [Request] ' + req.baseUrl + ' - ' + JSON.stringify(error));
    }

    next();
  }
}
