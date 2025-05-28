// src/common/filters/all-exception.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private readonly loggerTerminal = new Logger('😟😕 AllExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const message =
      typeof errorResponse === 'object'
        ? (errorResponse as any).message || 'Error'
        : errorResponse;

    // Log the exception
    this.loggerTerminal.error(
      `HTTP Status: ${status} Error Message: ${JSON.stringify(message)}`,
    );

    // Return standardized error response format
    response.status(status).json({
      message: Array.isArray(message) ? message[0] : message,
      statusCode: status,
      result: null,
    });
  }
}
