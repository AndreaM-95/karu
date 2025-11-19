import * as dotenv from 'dotenv';
import { User } from './src/modules/users/entities/user.entity';
import { Trip } from './src/modules/trips/entities/trip.entity';
import { Locations } from './src/modules/trips/entities/locations.entity';
import { Vehicle } from './src/modules/vehicles/entities/vehicle.entity';
import { Payment } from './src/modules/payments/entities/payment.entity';
import { Rating } from './src/modules/ratings/entities/rating.entity';
import { DataSource } from 'typeorm';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Vehicle, Trip, Payment, Rating, Locations],
  migrations: ['./src/migrations/*.ts'],
});
