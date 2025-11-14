import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class RecoverPasswordDTO {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(6, 50)
  newPassword: string;
}