import {
  HttpStatus,
  Injectable,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Trip, TripStatus } from '../trips/entities/trip.entity';
import { CreatePaymentFromTripDto } from './dto/create-payment-from-trip.dto';
import { PassengerPaymentHistoryQueryDto } from './dto/passenger-payment-history-query.dto';
import { EarningsQueryDto } from './dto/earnings-query.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { CustomHttpException } from 'src/common/exceptions/custom-http.exception';
import { UserRole } from '../users/entities/user.entity';

/**
 * Handles trip payments, distribution logic, user earnings and admin summaries.
 */
@Injectable()
export class PaymentsService {
  private readonly ALLOWED_PAYMENT_METHODS = ['cash', 'card', 'transfer'];
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
  ) {}

  /**
   * Calculates payment distribution among admin, driver and owner.
   *
   * @param {number} amount Total payment amount.
   * @param {boolean} hasOwner Whether the vehicle has an owner.
   * @param {number} [ownerShareOfRemaining=0.4] Owner share of the remaining 90%.
   * @returns {{ adminShare: number; driverShare: number; ownerShare: number }}
   */
  private calculateDistribution(
    amount: number,
    hasOwner: boolean,
    ownerShareOfRemaining = 0.4,
  ) {
    const totalCents = Math.round(amount * 100);

    const adminCents = Math.round(totalCents * 0.1);
    const remainingCents = totalCents - adminCents;

    let driverCents: number;
    let ownerCents: number;

    if (hasOwner) {
      const ownerCentsCalc = Math.round(remainingCents * ownerShareOfRemaining);
      driverCents = remainingCents - ownerCentsCalc;
      ownerCents = ownerCentsCalc;
    } else {
      driverCents = remainingCents;
      ownerCents = 0;
    }

    const sumCheck = adminCents + driverCents + ownerCents;
    if (sumCheck !== totalCents) {
      this.logger.error(
        `Distribution error: admin=${adminCents}, driver=${driverCents}, owner=${ownerCents}, total=${totalCents}`,
      );
      throw new CustomHttpException(
        'Error calculating the payment distribution',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      adminShare: adminCents / 100,
      driverShare: driverCents / 100,
      ownerShare: ownerCents / 100,
    };
  }

  /**
   * Registers a payment for a completed trip.
   *
   * @param {CreatePaymentFromTripDto} dto Payment data.
   * @param {number} currentUserId Authenticated passenger id.
   * @returns {Promise<{ success: boolean; message: string; data: PaymentResponseDto }>}
   */
  async createPaymentFromTrip(
    dto: CreatePaymentFromTripDto,
    currentUserId: number,
  ) {
    this.logger.log(
      `Attempting to register payment. tripId=${dto.tripId}, userId=${currentUserId}`,
    );

    try {
      const tripId = Number(dto.tripId);
      if (!tripId || isNaN(tripId) || tripId <= 0) {
        throw new CustomHttpException(
          'The trip identifier (tripId) is not valid',
        );
      }

      if (!dto.paymentMethod || typeof dto.paymentMethod !== 'string') {
        throw new CustomHttpException('The payment method is required');
      }

      const normalizedMethod = dto.paymentMethod.toLowerCase().trim();
      if (!this.ALLOWED_PAYMENT_METHODS.includes(normalizedMethod)) {
        throw new CustomHttpException(
          `Payment method not allowed. Valid methods: ${this.ALLOWED_PAYMENT_METHODS.join(
            ', ',
          )}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const trip = await this.tripRepository.findOne({
        where: { idTrip: tripId },
        relations: ['passenger', 'driver', 'vehicle', 'vehicle.owner', 'payment'],
      });

      if (!trip) {
        throw new CustomHttpException('The trip does not exist', HttpStatus.NOT_FOUND);
      }

      if (trip.statusTrip !== TripStatus.COMPLETED) {
        throw new CustomHttpException(
          'Payments can only be registered for completed trips',
        );
      }

      if (trip.payment) {
        throw new CustomHttpException(
          'This trip already has a registered payment',
        );
      }

      if (!trip.passenger || trip.passenger.idUser !== currentUserId) {
        throw new CustomHttpException(
          'You cannot register a payment for a trip that is not yours',
          HttpStatus.FORBIDDEN,
        );
      }

      const amount = Number(trip.cost);
      if (isNaN(amount) || amount <= 0) {
        throw new CustomHttpException('The trip cost is not valid');
      }

      const hasOwner = !!trip.vehicle && !!trip.vehicle['owner'];
      const ownerShareOfRemaining = hasOwner ? 0.4 : 0;

      const distribution = this.calculateDistribution(
        amount,
        hasOwner,
        ownerShareOfRemaining,
      );

      const result = await this.paymentRepository.manager.transaction(
        async (manager) => {
          const payment = manager.create(Payment, {
            trip,
            amount,
            paymentMethod: normalizedMethod,
            paymentStatus: PaymentStatus.COMPLETED,
            paymentDate: new Date(),
            ...distribution,
          } as any);

          return await manager.save(payment);
        },
      );

      const response: PaymentResponseDto = {
        idPayment: result.idPayment,
        tripId: trip.idTrip,
        amount: result.amount,
        paymentMethod: result.paymentMethod,
        paymentStatus: result.paymentStatus,
        paymentDate: result.paymentDate,
      };

      return {
        success: true,
        message: 'Payment registered successfully',
        data: response,
      };
    } catch (error) {
      this.logger.error(
        '[createPaymentFromTrip] Error registering trip payment',
        error?.stack,
      );
      if (error instanceof CustomHttpException) throw error;
      throw new CustomHttpException(
        'Error registering trip payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Returns the payment history for a passenger.
   *
   * @param {number} passengerId Passenger identifier.
   * @param {PassengerPaymentHistoryQueryDto} query Pagination and filters.
   * @returns {Promise<{ success: boolean; total: number; page: number; limit: number; data: any[] }>}
   */
  async getPassengerPaymentHistory(
    passengerId: number,
    query: PassengerPaymentHistoryQueryDto,
  ) {
    this.logger.log(
      `Fetching payment history. passengerId=${passengerId}`,
    );

    try {
      let page = Number(query.page ?? 1);
      let limit = Number(query.limit ?? 10);

      if (isNaN(page) || page < 1) page = 1;
      if (isNaN(limit) || limit < 1) limit = 10;
      if (limit > 50) limit = 50;

      const skip = (page - 1) * limit;

      const [payments, total] = await this.paymentRepository.findAndCount({
        where: {
          trip: {
            passenger: { idUser: passengerId },
          },
        },
        relations: ['trip'],
        order: { paymentDate: 'DESC' },
        skip,
        take: limit,
      });

      return {
        success: true,
        total,
        page,
        limit,
        data: payments.map((p) => ({
          idPayment: p.idPayment,
          tripId: p.trip?.idTrip,
          amount: p.amount,
          paymentMethod: p.paymentMethod,
          paymentStatus: p.paymentStatus,
          paymentDate: p.paymentDate,
        })),
      };
    } catch (error) {
      this.logger.error(
        '[getPassengerPaymentHistory] Error fetching payment history',
        error?.stack,
      );
      if (error instanceof CustomHttpException) throw error;
      throw new CustomHttpException(
        'Error fetching payment history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Returns the earnings per trip for the authenticated user.
   *
   * @param {any} currentUser User data including id and role.
   * @param {EarningsQueryDto} query Pagination and filters.
   * @returns {Promise<{ success: boolean; total: number; page: number; limit: number; data: any[] }>}
   */
  async getUserEarningsByTrip(currentUser: any, query: EarningsQueryDto) {
    this.logger.log(
      `Fetching earnings. userId=${currentUser.idUser}, role=${currentUser.role}`,
    );

    try {
      const role: UserRole = currentUser.role;
      const userId: number = currentUser.idUser;

      if (![UserRole.DRIVER, UserRole.OWNER, UserRole.ADMIN].includes(role)) {
        throw new CustomHttpException(
          'This service is only available for drivers, owners, or administrators',
          HttpStatus.FORBIDDEN,
        );
      }

      let page = Number(query.page ?? 1);
      let limit = Number(query.limit ?? 10);

      if (isNaN(page) || page < 1) page = 1;
      if (isNaN(limit) || limit < 1) limit = 10;
      if (limit > 50) limit = 50;

      const skip = (page - 1) * limit;

      const qb = this.paymentRepository
        .createQueryBuilder('payment')
        .innerJoinAndSelect('payment.trip', 'trip')
        .innerJoinAndSelect('trip.driver', 'driver')
        .innerJoinAndSelect('trip.vehicle', 'vehicle')
        .leftJoinAndSelect('vehicle.owner', 'owner');

      if (query.fromDate) {
        const from = new Date(query.fromDate);
        if (isNaN(from.getTime())) {
          throw new CustomHttpException(
            'fromDate does not have a valid date format (YYYY-MM-DD)',
          );
        }
        qb.andWhere('payment.paymentDate >= :fromDate', {
          fromDate: query.fromDate,
        });
      }

      if (query.toDate) {
        const to = new Date(query.toDate);
        if (isNaN(to.getTime())) {
          throw new CustomHttpException(
            'toDate does not have a valid date format (YYYY-MM-DD)',
          );
        }
        qb.andWhere('payment.paymentDate <= :toDate', {
          toDate: query.toDate,
        });
      }

      if (query.fromDate && query.toDate) {
        if (new Date(query.fromDate) > new Date(query.toDate)) {
          throw new CustomHttpException(
            'fromDate cannot be greater than toDate',
          );
        }
      }

      if (query.paymentStatus) {
        qb.andWhere('payment.paymentStatus = :paymentStatus', {
          paymentStatus: query.paymentStatus,
        });
      }

      if (query.paymentMethod) {
        qb.andWhere('payment.paymentMethod = :paymentMethod', {
          paymentMethod: query.paymentMethod,
        });
      }

      if (role === UserRole.DRIVER) {
        qb.andWhere('driver.idUser = :userId', { userId });
      } else if (role === UserRole.OWNER) {
        qb.andWhere('owner.idUser = :userId', { userId });
      }

      qb.orderBy('payment.paymentDate', 'DESC').skip(skip).take(limit);

      const [payments, total] = await qb.getManyAndCount();

      const data = payments.map((p) => {
        let amountForUser = 0;

        if (role === UserRole.DRIVER) amountForUser = p.driverShare;
        else if (role === UserRole.OWNER) amountForUser = p.ownerShare;
        else if (role === UserRole.ADMIN) amountForUser = p.adminShare;

        return {
          tripId: p.trip.idTrip,
          amount: amountForUser,
          paymentDate: p.paymentDate,
          paymentStatus: p.paymentStatus,
        };
      });

      return {
        success: true,
        total,
        page,
        limit,
        data,
      };
    } catch (error) {
      this.logger.error(
        '[getUserEarningsByTrip] Error fetching user earnings',
        error?.stack,
      );
      if (error instanceof CustomHttpException || error instanceof ForbiddenException)
        throw error;
      throw new CustomHttpException(
        'Error fetching user earnings',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Returns an admin summary of all payments and their distributions.
   *
   * @param {{ startDate?: string; endDate?: string }} filters Optional date filters.
   * @returns {Promise<{ success: boolean; totalPayments: number; totalAmount: number; totalAdminShare: number; totalDriverShare: number; totalOwnerShare: number; data: any[] }>}
   */
  async getAdminSummary(filters: { startDate?: string; endDate?: string }) {
    this.logger.log(
      `Fetching admin summary. startDate=${filters.startDate}, endDate=${filters.endDate}`,
    );

    try {
      const { startDate, endDate } = filters;

      const qb = this.paymentRepository
        .createQueryBuilder('payment')
        .leftJoinAndSelect('payment.trip', 'trip');

      if (startDate) {
        const from = new Date(startDate);
        if (isNaN(from.getTime())) {
          throw new CustomHttpException(
            'startDate does not have a valid date format (YYYY-MM-DD)',
          );
        }
        qb.andWhere('payment.paymentDate >= :startDate', { startDate });
      }

      if (endDate) {
        const to = new Date(endDate);
        if (isNaN(to.getTime())) {
          throw new CustomHttpException(
            'endDate does not have a valid date format (YYYY-MM-DD)',
          );
        }
        qb.andWhere('payment.paymentDate <= :endDate', { endDate });
      }

      if (startDate && endDate) {
        if (new Date(startDate) > new Date(endDate)) {
          throw new CustomHttpException(
            'startDate cannot be greater than endDate',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const payments = await qb.getMany();

      const totals = payments.reduce(
        (acc, p) => {
          acc.totalAmount += Number(p.amount) || 0;
          acc.totalAdminShare += Number(p.adminShare) || 0;
          acc.totalDriverShare += Number(p.driverShare) || 0;
          acc.totalOwnerShare += Number(p.ownerShare) || 0;
          return acc;
        },
        {
          totalAmount: 0,
          totalAdminShare: 0,
          totalDriverShare: 0,
          totalOwnerShare: 0,
        },
      );

      return {
        success: true,
        totalPayments: payments.length,
        ...totals,
        data: payments.map((p) => ({
          idPayment: p.idPayment,
          tripId: p.trip?.idTrip,
          amount: p.amount,
          adminShare: p.adminShare,
          driverShare: p.driverShare,
          ownerShare: p.ownerShare,
          paymentDate: p.paymentDate,
          paymentStatus: p.paymentStatus,
        })),
      };
    } catch (error) {
      this.logger.error(
        '[getAdminSummary] Error fetching admin summary',
        error?.stack,
      );
      if (error instanceof CustomHttpException) throw error;
      throw new CustomHttpException(
        'Error fetching admin summary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
