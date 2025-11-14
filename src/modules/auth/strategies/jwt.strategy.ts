import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET_KEY') || 'your-secret-key-here',
        });
    }

    /**
     * Valida el payload del JWT y retorna el usuario
     * Este método es llamado automáticamente por Passport después de verificar el token
     */
    async validate(payload: any) {
        // El payload contiene: { sub: idUser, name, email, role, driverStatus }
        const user = await this.userRepo.findOne({
            where: { idUser: payload.sub }, // ⚠️ CORREGIDO: Ahora usa idUser
            select: ['idUser', 'name', 'email', 'role', 'phone', 'gender', 'active', 'driverStatus']
        });

        if (!user) {
            throw new UnauthorizedException('Usuario no encontrado');
        }

        if (!user.active) {
            throw new UnauthorizedException('Usuario inactivo');
        }

        return {
            idUser: user.idUser,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            gender: user.gender,
            driverStatus: user.driverStatus,
        };
    }
}