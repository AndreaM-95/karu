import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from './src/modules/users/entities/User.entity';
import { UserRole } from './src/modules/users/entities/UserRoles.entity';
import { DriverDocument } from './src/modules/users/entities/DriverDocuments.entity';
import { DriverVehicle } from './src/modules/vehicles/entities/DriverVehicle.entity';
import { Vehicle } from './src/modules/vehicles/entities/Vehicle.entity';
import { Rating } from './src/modules/ratings/entities/Rating.entity';
import { DistributionPayment } from './src/modules/payments/entities/DistributionPayment.entity';
import { PricingRule } from './src/modules/payments/entities/PricingRules.entity';
import { Settlement } from './src/modules/payments/entities/Settlement.entity';
import { Payment } from './src/modules/payments/entities/Payment.entity';
import { Trip } from './src/modules/trips/entities/trip.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    User,
    UserRole,
    DriverDocument,
    DriverVehicle,
    Vehicle,
    Trip,
    Payment,
    PricingRule,
    DistributionPayment,
    Settlement,
    Rating,
  ],
  migrations: ['./src/migrations/*.ts'],
});
