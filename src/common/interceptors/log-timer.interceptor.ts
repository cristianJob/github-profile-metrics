import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LogTimerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { method, url } = req;
    const start = Date.now();
    console.log(`-> ${method} ${url} start`);
    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        console.log(`<- ${method} ${url} end (${ms}ms)`);
      }),
    );
  }
}
