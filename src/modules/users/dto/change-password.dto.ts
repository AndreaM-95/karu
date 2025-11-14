import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDTO {
    @ApiProperty({
        description: 'Email del usuario',
        example: 'usuario@ejemplo.com'
    })
    @IsEmail({}, { message: 'Debe ser un email válido' })
    @IsNotEmpty({ message: 'El email es requerido' })
    email: string;

    @ApiProperty({
        description: 'Contraseña actual del usuario',
        example: 'Password123!',
        minLength: 8
    })
    @IsString()
    @IsNotEmpty({ message: 'La contraseña actual es requerida' })
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    currentPassword: string;

    @ApiProperty({
        description: 'Nueva contraseña del usuario',
        example: 'NewPassword456!',
        minLength: 8
    })
    @IsString()
    @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
    @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
        { 
            message: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial' 
        }
    )
    newPassword: string;
}