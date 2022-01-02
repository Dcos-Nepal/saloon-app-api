import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class SelfOrAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const userId = req.params.userId || req.body.user;
    const hasPermission = user.roles.some((role) => role == 'ADMIN') || user._id.toString() == userId;

    return hasPermission;
  }
}
