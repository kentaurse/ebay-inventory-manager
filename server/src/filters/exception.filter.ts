import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AnalyticsError, DataFetchError, ValidationError } from '../exceptions/custom-exceptions';
import { Logger } from '../utils/logger';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } else if (exception instanceof AnalyticsError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      errorCode = exception.code;
    } else if (exception instanceof DataFetchError) {
      status = HttpStatus.NOT_FOUND;
      message = exception.message;
      errorCode = 'DATA_NOT_FOUND';
    } else if (exception instanceof ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      errorCode = 'VALIDATION_ERROR';
    }

    Logger.error(`Exception occurred: ${message}`, exception);

    response.status(status).json({
      statusCode: status,
      message,
      errorCode,
      timestamp: new Date().toISOString(),
    });
  }
} 