import {
  Catch,
  HttpException,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch(HttpException)
export class ApiErrors implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus();
    const error = exception.getResponse();

    response.status(status).json({
      success: false,
      statusCode: status,
      error,
    });
  }
}
