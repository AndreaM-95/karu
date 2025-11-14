import { IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../entities/Payment.entity';

export class CreatePaymentFromTripDto {
  @Type(() => Number)
  @IsInt()
  tripId: number;

  @IsEnum(['cash', 'card', 'transfer'])
  paymentMethod: PaymentMethod;
}
