import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from '.src/modules/auth/decorators/user.decorator';
import { UserRole
import { Vehicle } from './entities/Vehicle';
import { DriverDocument } from './entities/DriverDocument';
import { DriverVehicle } from './entities/DriverVehicle';
import { RoadTrip } from './entities/RoadTrip';
import { Payment } from './entities/Payment';
import { DistributionPayment } from './entities/DistributionPayment';
import { Settlement } from './entities/Settlement';
import { Rating } from './entities/Rating';
import { Location } from './entities/Location';
import { PricingRule } from './entities/PricingRule';
import { ActivityLog } from './entities/ActivityLog';


dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [],
  migrations: ['./src/migrations/*.ts'],
});
