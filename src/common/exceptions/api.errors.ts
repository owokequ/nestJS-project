import {
  Catch,
  HttpException,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch(HttpException)
export class ApiErrors implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const logger = new Logger();
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const error = exception.getResponse() as Error;

    logger.error(
      `{${request.url}} - [StatusCode: ${status}]  [Error: ${error.message}]`,
    );
    response.status(status).json({
      success: false,
      status_сode: status,
      path: request.url,
      timestamp: new Date(),
      error: error.message,
    });
  }
}
