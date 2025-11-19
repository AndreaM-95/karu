import { IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PaymentMethod } from '../entities/payment.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentFromTripDto {
  @ApiProperty({
    description: 'Trip identifier that is already in COMPLETED status',
    example: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tripId: number;

  @ApiProperty({
    description: 'Payment method used for the trip',
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
  })
  @IsNotEmpty()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
