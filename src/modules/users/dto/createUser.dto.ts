import { IsEmail, IsEnum, IsNotEmpty, IsString, Length, Max, Min } from "class-validator";
import { Gender, UserRole } from "../entities/user.entity";
import { Transform } from "class-transformer";

export class createUserDTO{

    @IsNotEmpty({ message: 'Name is required'})
    @IsString()
    @Transform(({ value }) => value.trim().toUpperCase())
    name: string;

    @IsNotEmpty({ message: 'Gender is required'})
     @IsEnum(Gender, { message: 'Gender must be male, female, or other' })
    gender:Gender;

    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Invalid email' })
    email: string;

    @IsNotEmpty()
    @Min(10, { message: "The phone number must be have 10  digits"})
    @Max(10, { message: "The phone number must be have 10  digits"})
    phone:number;

    @IsNotEmpty()
    @IsString()
    @Length(6, 10, { message: 'The password must be al least 6 characters long and no more than 10 characters'})
    password:string;

    @IsNotEmpty()
    @IsEnum(UserRole, { message: 'Role must be admin, owner, driver or passenger' })
    role: UserRole;

}