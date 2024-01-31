import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common'
import { Observable } from 'rxjs'

@Injectable()
export class EmptyObjectInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const [request] = context.getArgs()
    const { body } = request

    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestException('Employee data cannot be empty')
    }

    return next.handle()
  }
}
