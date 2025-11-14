import { 
    Controller, 
    Post, 
    Body, 
    Get, 
    Request, 
    UseGuards,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDTO} from '../users/dto/login-user.dto';
import { createUserDTO } from '../users/dto/createUser.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RecoverPasswordDTO } from '../users/dto/recover-password.dto';
import { ChangePasswordDTO } from '../users/dto/change-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    /**
     * Registra un nuevo usuario en el sistema
     * POST http://localhost:3000/api/auth/register
     */
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Registrar un nuevo usuario' })
    @ApiResponse({ 
        status: 201, 
        description: 'Usuario registrado exitosamente',
    })
    @ApiResponse({ 
        status: 409, 
        description: 'Email o teléfono ya registrado',
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Datos inválidos',
    })
    async register(@Body() data: createUserDTO) {
        return this.authService.register(data);
    }

    /**
     * Autentica un usuario y genera token JWT
     * POST http://localhost:3000/api/auth/login
     */
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Iniciar sesión' })
    @ApiResponse({ 
        status: 200, 
        description: 'Login exitoso',
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Credenciales inválidas o usuario inactivo',
    })
    async login(@Body() data: LoginUserDTO) {
        return this.authService.login(data);
    }

    /**
     * Cambia la contraseña del usuario (requiere contraseña actual)
     * POST http://localhost:3000/api/auth/change-password
     */
    @Post('change-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Cambiar contraseña (requiere contraseña actual)' })
    @ApiResponse({ 
        status: 200, 
        description: 'Contraseña actualizada exitosamente',
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Contraseña actual incorrecta',
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Usuario no encontrado',
    })
    async changePassword(@Body() data: ChangePasswordDTO) {
        return this.authService.changePassword(data);
    }

    /**
     * Recupera la contraseña (sin requerir contraseña actual)
     * TODO: Implementar envío de email con token temporal
     * POST http://localhost:3000/api/auth/recover-password
     */
    @Post('recover-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
        summary: 'Recuperar contraseña (sin requerir contraseña actual)',
        description: 'En producción, esto debería enviar un email con un token temporal'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Instrucciones enviadas al email',
    })
    async recoverPassword(@Body() data: RecoverPasswordDTO) {
        return this.authService.recoverPassword(data);
    }

    /**
     * Obtiene el perfil del usuario autenticado
     * GET http://localhost:3000/api/auth/profile
     * Requiere: Bearer Token en el header Authorization
     */
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
    @ApiResponse({ 
        status: 200, 
        description: 'Perfil obtenido exitosamente',
    })
    @ApiResponse({ 
        status: 401, 
        description: 'No autorizado - Token inválido o expirado',
    })
    getProfile(@Request() req) {
        return {
            message: 'Perfil obtenido exitosamente',
            user: req.user
        };
    }
}

