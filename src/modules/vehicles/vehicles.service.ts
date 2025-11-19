import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle, VehicleStatus } from './entities/vehicle.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Trip } from '../trips/entities/trip.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { AssignDriverDto } from './dto/assing-driver.dto';
import { QueryVehicleDto } from './dto/query-vehicle.dto';

/**
 * Service responsible for handling vehicle operations
 * including creation, assignment, queries, and statistics
 */
@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);

  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Trip)
    private readonly tripRepo: Repository<Trip>,
  ) {}


}

