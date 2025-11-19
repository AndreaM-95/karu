import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { Vehicle } from './entities/vehicle.entity';
import { User } from '../users/entities/user.entity';
import { Trip } from '../trips/entities/trip.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, User, Trip])],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService], // Exportar para usar en otros módulos
})
export class VehiclesModule {}
