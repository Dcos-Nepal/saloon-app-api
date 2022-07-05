import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class WorkerVerificationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const isWorker = user.roles.some((role) => role == 'WORKER');

    if (isWorker) {
      return user?.userData?.isApproved || false;
    }

    return true;
  }
}
