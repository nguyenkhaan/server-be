import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    return next.handle().pipe(
      map((response) => {
        if (
          response &&
          typeof response === 'object' &&
          'data' in response
        ) {
          return response;
        }

        return {
          success: true, 
          data: response,
        };
      }),
    );
  }
}
