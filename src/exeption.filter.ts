import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
@Catch(Error)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    if (process.env.environment !== 'production') {
      response.status(500).send({
        error: exception.toString(),
        stack: exception.stack.toString(),
      });
    } else {
      response.status(500).send('An error occurred');
    }
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const errorResponse = {
      errorsMessages: [],
    };
    const res: any = exception.getResponse();
    errorResponse.errorsMessages = res.message;
    // console.log(status);
    // console.log(res);
    if (status === 400) {
      response.status(status).json(errorResponse);
    } else if (status === 401) {
      response.sendStatus(status);
    } else if (status === 404) {
      response.sendStatus(status);
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
