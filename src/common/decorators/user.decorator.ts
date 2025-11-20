
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
/**
 * Decorador @User:
 * Extrae el objeto del usuario autenticado desde la petición HTTP.
 * Permite acceder directamente al usuario en los controladores
 * sin necesidad de obtenerlo manualmente desde el request.
 */
export const User = createParamDecorator(
  /**
   * @returns El usuario autenticado dentro del objeto request.
   */
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);