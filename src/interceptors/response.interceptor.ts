import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LoggingModel } from '@n-models';

export interface Response<T> {
  message: string;
  statusCode: number;
  result: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((res: T) => this.responseHandler(res, context)),
      catchError((error) => throwError(() => error)),
    );
  }

  responseHandler(res: T, context: ExecutionContext): Response<T> {
    if (res instanceof BaseExceptionFilter) {
      throw res;
    }

    const ctx = context.switchToHttp();
    const request = ctx.getRequest();

    const rawReqBody = request.body;
    const rawResBody =
      typeof res === 'object' ? JSON.parse(JSON.stringify(res)) : res;

    const responseLog: LoggingModel = {
      timestamp: new Date().getTime().toString(),
      id: new Date().getTime().toString(),
      request: {
        type: 'http',
        body: rawReqBody,
        ip: request.ip,
        userAgent: request.get('user-agent'),
        path: request?.path,
      },
      response: {
        body: rawResBody,
      },
    };

    return {
      message: 'Success',
      statusCode: HttpStatus.OK,
      result: responseLog.response.body,
    };
  }
}
