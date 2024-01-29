import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { Reflector } from '@nestjs/core'
import { User } from '../auth.service'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<Array<'employee' | 'client'>>(
      'roles',
      context.getHandler(),
    )
    if (!roles) {
      return true
    }
    const request = context.switchToHttp().getRequest()
    const user: User = request.user
    return user && roles.includes(user.role)
  }
}

export const Roles = (...roles: Array<'employee' | 'client'>) =>
  SetMetadata('roles', roles)
