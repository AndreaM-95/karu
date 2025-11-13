// este modulo define la guardia JWT para proteger rutas
import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

// Guardia de autenticación JWT
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt'){}