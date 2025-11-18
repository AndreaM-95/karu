import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';
import { ApiProperty } from '@nestjs/swagger';

export class EarningsQueryDto {
  @ApiProperty({
    description:
      'Start date for filtering payments (included) in YYYY-MM-DD format',
    example: '2025-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({
    description:
      'End date for filtering payments (included) in YYYY-MM-DD format',
    example: '2025-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiProperty({
    description: 'Filter by payment status',
    enum: PaymentStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiProperty({
    description: 'Filter by payment method',
    enum: PaymentMethod,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: 'Number of records per page (max. 50)',
    example: 10,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  // Filtrar por conductor (útil para vistas de admin)
  @ApiProperty({
    description:
      'Filter by driver ID (will only affect administrator queries)',
    example: 7,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  driverId?: number;

  // Filtrar por propietario (útil para vistas de admin)
  @ApiProperty({
    description:
      'Filter by owner ID (will only affect administrator queries)',
    example: 5,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ownerId?: number;
}
