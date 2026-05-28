import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'

@Catch()
export class HttpExceptionFilter
  implements ExceptionFilter {

  catch(
    exception: any,
    host: ArgumentsHost,
  ) {

    const ctx =
      host.switchToHttp()

    const response =
      ctx.getResponse()

    const request =
      ctx.getRequest()

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : null

    let message = 'Internal server error'

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {

      const res =
        exceptionResponse as any

      if (Array.isArray(res.message)) {
        message = res.message[0]
      } else {
        message = res.message
      }

    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      path: request.url,
    })
  }

}