import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  
  @Catch()
  export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
  
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message: string | string[] = 'Internal server error';
      let errors: any = null;
  
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        const res = exception.getResponse();
  
        if (typeof res === 'string') {
          message = res;
        } else if (typeof res === 'object') {
          message = (res as any).message || exception.message;
          errors = (res as any).errors || null;
        }
      } else {
        message = 'Unexpected error';
      }
  
      response.status(status).json({
        success: false,
        errorCode: status,
        message,
        errors,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    }
  }
  