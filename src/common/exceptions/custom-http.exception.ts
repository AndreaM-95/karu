import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        success: false,
        statusCode,
        message,
        timestamp: new Date().toLocaleString('es-CO', {
          timeZone: 'America/Bogota',
        }),
      },
      statusCode,
    );
  }
}
