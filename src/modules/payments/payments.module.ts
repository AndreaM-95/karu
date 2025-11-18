import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { Trip } from '../trips/entities/trip.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Trip])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
