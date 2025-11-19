import { IsDateString, IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Length, Max, Min, ValidateIf} from "class-validator";
import { Gender, LicenseCategory, UserRole } from "../entities/user.entity";
import { Transform } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class createUserDTO{

    @ApiProperty({description: 'Full name of the user (automatically transformed to uppercase)', example: 'JUAN PÉREZ', minLength: 5, maxLength: 100})
    @IsNotEmpty({ message: 'Name is required'})
    @IsString()
    @Length(5, 100, { message: 'Name must be between 5 and 100 characters' })
    @Transform(({ value }) => value.trim().toUpperCase())
    name: string;

    @ApiProperty({description: 'Gender of the user', enum: Gender,example: Gender.FEMALE})
    @IsNotEmpty({ message: 'Gender is required'})
    @IsEnum(Gender, { message: 'Gender must be male, female, or other' })
    gender:Gender;

    @ApiProperty({ description: 'Email address of the user', example: 'user@example.com'})
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @ApiProperty({ description: 'Phone number of the user (10 digits)', example: '3104567890', minLength: 10, maxLength: 10})
    @IsNotEmpty({ message: 'Phone is required' })
    @IsString()
    @Length(10, 10, { message: "Phone number must have exactly 10 digits" })
    phone:string;
    
    @ApiProperty({ description: 'Birth date of the user (YYYY-MM-DD)', example: '1995-08-15'})
    @IsNotEmpty({ message: 'Birth date is required' })
    @IsDateString({}, { message: 'Birth date must be in format YYYY-MM-DD' })
    @IsString()
    dateOfBirth: string;

    @ApiProperty({ description: 'Password for the user account (6-10 characters)', example: 'secret12', minLength: 6, maxLength: 10})
    @IsNotEmpty({ message: 'Password is required' })
    @IsString()
    @Length(6, 10, { message: 'The password must be al least 6 characters long and no more than 10 characters'})
    password:string;

    @ApiProperty({ description: 'Role of the user in the system', enum: UserRole, example: UserRole.PASSENGER})
    @IsNotEmpty({ message: 'Role is required' })
    @IsEnum(UserRole, { message: 'Role must be admin, owner, driver or passenger' })
    role: UserRole;
    
    @ApiPropertyOptional({ description: 'Driver license number (required if role is driver)', example: 12345678, type: Number})
    @ValidateIf(us => us.role === UserRole.DRIVER)
    @IsNotEmpty({ message: 'Driver license is required for drivers' })
    @IsInt({ message: 'Driver license must be a number' })
    driverLicense?: number;
    
    @ApiPropertyOptional({ description: 'License category (required if role is driver)', enum: LicenseCategory , example: LicenseCategory .B2})
    @ValidateIf(us => us.role === UserRole.DRIVER)
    @IsNotEmpty({ message: 'License category is required for drivers' })
    @IsEnum(LicenseCategory , {message: 'License category must be a1, a2, b1, b2, or b3'})
    licenseCategory?: LicenseCategory;


    @ApiPropertyOptional({description: 'Driver license expiration date (required if role is driver, format YYYY-MM-DD)',example: '2027-12-31'})
    @ValidateIf(us => us.role === UserRole.DRIVER)
    @IsNotEmpty({ message: 'License expiration date is required for drivers' })
    @IsDateString({}, { message: 'License expiration date must be a valid date in format YYYY-MM-DD' })
    licenseExpirationDate?: string;

}