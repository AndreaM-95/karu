import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentResponseDto {
  @ApiProperty({
    description: 'Payment identifier',
    example: 1,
  })
  idPayment: number;

  @ApiProperty({
    description: 'Identifier of the trip associated with the payment',
    example: 15,
  })
  tripId: number;

  @ApiProperty({
    description: 'Total amount of the trip payment',
    example: 40000,
  })
  amount: number;

  @ApiProperty({
    description: 'Payment method used',
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
  })
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Current status of the payment',
    enum: PaymentStatus,
    example: PaymentStatus.COMPLETED,
  })
  paymentStatus: PaymentStatus;

  @ApiProperty({
    description: 'Date and time when the payment was registered',
    example: '2025-11-15T15:30:00.000Z',
  })
  paymentDate: Date;
}
