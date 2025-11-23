import { ForbiddenException } from '@nestjs/common';
import { PaymentsService } from '../payments.service';
import { Payment, PaymentMethod, PaymentStatus } from '../entities/payment.entity';
import { Trip, TripStatus } from '../../trips/entities/trip.entity';
import { CustomHttpException } from 'src/common/exceptions/custom-http.exception';
import { UserRole } from '../../users/entities/user.entity';

describe('PaymentsService - lógica de negocio', () => {
  let service: PaymentsService;
  let paymentRepo: any;
  let tripRepo: any;

  // silencio los console.error para que Jest no ensucie la salida
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  beforeEach(() => {
    paymentRepo = {
      manager: {
        transaction: jest.fn(),
      },
      findAndCount: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    tripRepo = {
      findOne: jest.fn(),
    };

    // Instancio el servicio con repos fake
    service = new PaymentsService(paymentRepo as any, tripRepo as any);
  });

  // -------------------- HU-01: Registrar pago al finalizar el viaje --------------------

  describe('createPaymentFromTrip', () => {
    const pasajeraId = 10;

    const buildTrip = (override: Partial<Trip> = {}): any => ({
      idTrip: 1,
      statusTrip: TripStatus.COMPLETED,
      cost: 40000,
      passenger: { idUser: pasajeraId },
      driver: { idUser: 20 },
      vehicle: { owner: { idUser: 30 } },
      payment: null,
      ...override,
    });

    const setupTransactionMock = (savedPayment: Partial<Payment>) => {
      const manager = {
        create: jest.fn().mockReturnValue(savedPayment),
        save: jest.fn().mockResolvedValue(savedPayment),
      };
      paymentRepo.manager.transaction.mockImplementation(async (cb: any) => {
        return cb(manager);
      });
      return manager;
    };

    it('It throws an error if the tripId is invalid', async () => {
      await expect(
        service.createPaymentFromTrip(
          { tripId: 0 as any, paymentMethod: PaymentMethod.CASH } as any,
          pasajeraId,
        ),
      ).rejects.toBeInstanceOf(CustomHttpException);

      await expect(
        service.createPaymentFromTrip(
          { tripId: -5 as any, paymentMethod: PaymentMethod.CASH } as any,
          pasajeraId,
        ),
      ).rejects.toBeInstanceOf(CustomHttpException);
    });

    it('It throws an error if the payment method is empty', async () => {
      await expect(
        service.createPaymentFromTrip(
          { tripId: 1 as any, paymentMethod: '' as any },
          pasajeraId,
        ),
      ).rejects.toBeInstanceOf(CustomHttpException);
    });

    it('It throws an error if the payment method is not allowed', async () => {
      await expect(
        service.createPaymentFromTrip(
          { tripId: 1 as any, paymentMethod: 'bitcoin' as any },
          pasajeraId,
        ),
      ).rejects.toBeInstanceOf(CustomHttpException);
    });

    it('It throws NOT_FOUND if the trip does not exist', async () => {
      tripRepo.findOne.mockResolvedValue(null);

      await expect(
        service.createPaymentFromTrip(
          { tripId: 1 as any, paymentMethod: PaymentMethod.CASH } as any,
          pasajeraId,
        ),
      ).rejects.toBeInstanceOf(CustomHttpException);

      expect(tripRepo.findOne).toHaveBeenCalled();
    });

    it('It throws an error if the trip is not in COMPLETED status', async () => {
      tripRepo.findOne.mockResolvedValue(
        buildTrip({ statusTrip: TripStatus.PENDING }),
      );

      await expect(
        service.createPaymentFromTrip(
          { tripId: 1 as any, paymentMethod: PaymentMethod.CASH } as any,
          pasajeraId,
        ),
      ).rejects.toBeInstanceOf(CustomHttpException);
    });

    it('It throws an error if the trip already has a registered payment', async () => {
      tripRepo.findOne.mockResolvedValue(
        buildTrip({ payment: { idPayment: 999 } as any }),
      );

      await expect(
        service.createPaymentFromTrip(
          { tripId: 1 as any, paymentMethod: PaymentMethod.CASH } as any,
          pasajeraId,
        ),
      ).rejects.toBeInstanceOf(CustomHttpException);
    });

    it('It throws an error if the authenticated user is not the passenger owner of the trip', async () => {
      tripRepo.findOne.mockResolvedValue(
        buildTrip({ passenger: { idUser: 999 } as any }),
      );

      await expect(
        service.createPaymentFromTrip(
          { tripId: 1 as any, paymentMethod: PaymentMethod.CASH } as any,
          pasajeraId,
        ),
      ).rejects.toBeInstanceOf(CustomHttpException);
    });

    it('It throws an error if the trip cost is invalid', async () => {
      tripRepo.findOne.mockResolvedValue(buildTrip({ cost: 0 as any }));

      await expect(
        service.createPaymentFromTrip(
          { tripId: 1 as any, paymentMethod: PaymentMethod.CASH } as any,
          pasajeraId,
        ),
      ).rejects.toBeInstanceOf(CustomHttpException);
    });

    it('It creates the payment correctly when the trip has an owner', async () => {
      const trip = buildTrip();
      tripRepo.findOne.mockResolvedValue(trip);

      const mockSaved: Partial<Payment> = {
        idPayment: 1,
        amount: trip.cost,
        paymentMethod: PaymentMethod.CASH,
        paymentStatus: PaymentStatus.COMPLETED,
        paymentDate: new Date(),
      };

      setupTransactionMock(mockSaved);

      const result = await service.createPaymentFromTrip(
        { tripId: trip.idTrip, paymentMethod: PaymentMethod.CASH } as any,
        pasajeraId,
      );

      expect(paymentRepo.manager.transaction).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data.idPayment).toBe(1);
      expect(result.data.tripId).toBe(trip.idTrip);
      expect(result.data.amount).toBe(trip.cost);
      expect(result.data.paymentMethod).toBe(PaymentMethod.CASH);
    });

    it('It creates the payment correctly when the trip does NOT have an owner', async () => {
      const trip = buildTrip({ vehicle: { owner: null } as any });
      tripRepo.findOne.mockResolvedValue(trip);

      const mockSaved: Partial<Payment> = {
        idPayment: 2,
        amount: trip.cost,
        paymentMethod: PaymentMethod.CARD,
        paymentStatus: PaymentStatus.COMPLETED,
        paymentDate: new Date(),
      };

      setupTransactionMock(mockSaved);

      const result = await service.createPaymentFromTrip(
        { tripId: trip.idTrip, paymentMethod: PaymentMethod.CARD } as any,
        pasajeraId,
      );

      expect(result.success).toBe(true);
      expect(result.data.idPayment).toBe(2);
    });
  });

  // -------------------- HU-01 helper: calculateDistribution --------------------

  describe('calculateDistribution (helper)', () => {
    it('distributes 10% to admin and 90% between driver/owner when there is an owner', () => {
      const dist = (service as any).calculateDistribution(100000, true);
      // admin 10k, restante 90k -> owner 40% de 90k = 36k, driver 54k
      expect(dist.adminShare).toBe(10000);
      expect(dist.ownerShare).toBe(36000);
      expect(dist.driverShare).toBe(54000);
      expect(dist.adminShare + dist.ownerShare + dist.driverShare).toBe(100000);
    });

    it('distributes 10% to admin and 90% only to driver when there is NO owner', () => {
      const dist = (service as any).calculateDistribution(50000, false);
      expect(dist.adminShare).toBe(5000);
      expect(dist.ownerShare).toBe(0);
      expect(dist.driverShare).toBe(45000);
    });
  });

  // -------------------- HU-02: Historial de pagos de la pasajera --------------------

  describe('getPassengerPaymentHistory', () => {
    it('returns the passenger payments with sanitized pagination', async () => {
      const passengerId = 10;

      const fakePayments: any[] = [
        {
          idPayment: 1,
          amount: 40000,
          paymentMethod: PaymentMethod.CASH,
          paymentStatus: PaymentStatus.COMPLETED,
          paymentDate: new Date(),
          trip: { idTrip: 1 },
        },
      ];

      paymentRepo.findAndCount.mockResolvedValue([fakePayments, 1]);

      const result = await service.getPassengerPaymentHistory(passengerId, {
        page: 1 as any,
        limit: 10 as any,
      } as any);

      expect(paymentRepo.findAndCount).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.total).toBe(1);
      expect(result.data.length).toBe(1);
      expect(result.data[0].tripId).toBe(1);
    });

    it('corrects page and limit when they come with strange values', async () => {
      const passengerId = 10;
      paymentRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.getPassengerPaymentHistory(passengerId, {
        page: -5 as any,
        limit: 999 as any,
      } as any);

      const args = paymentRepo.findAndCount.mock.calls[0][0];
      // page debería quedar en 1 y limit cap a 50
      expect(args.skip).toBe(0);
      expect(args.take).toBe(50);
    });
  });

  // -------------------- HU-04: Ver cuánto me corresponde por viaje --------------------

  describe('getUserEarningsByTrip', () => {
    const buildQbMock = (payments: any[], total: number) => {
      return {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([payments, total]),
      };
    };

    it('It throws CustomHttpException if the role is not driver/owner/admin', async () => {
      const currentUser = { idUser: 1, role: UserRole.PASSENGER } as any;

      await expect(
        service.getUserEarningsByTrip(currentUser, {} as any),
      ).rejects.toBeInstanceOf(CustomHttpException);
    });

    it('It returns the correct amounts for a driver', async () => {
      const currentUser = { idUser: 99, role: UserRole.DRIVER } as any;

      const payments = [
        {
          trip: { idTrip: 1 },
          driverShare: 30000,
          ownerShare: 10000,
          adminShare: 5000,
          paymentDate: new Date(),
          paymentStatus: PaymentStatus.COMPLETED,
        },
      ];

      const qb = buildQbMock(payments, payments.length);
      paymentRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getUserEarningsByTrip(currentUser, {
        page: 1 as any,
        limit: 5 as any,
      } as any);

      expect(paymentRepo.createQueryBuilder).toHaveBeenCalledWith('payment');
      expect(result.success).toBe(true);
      expect(result.total).toBe(1);
      expect(result.data[0].tripId).toBe(1);
      expect(result.data[0].amount).toBe(30000);
    });

    it('It validates that fromDate cannot be greater than toDate', async () => {
      const currentUser = { idUser: 99, role: UserRole.DRIVER } as any;
      const qb = buildQbMock([], 0);
      paymentRepo.createQueryBuilder.mockReturnValue(qb);

      await expect(
        service.getUserEarningsByTrip(currentUser, {
          fromDate: '2025-12-31',
          toDate: '2025-01-01',
        } as any),
      ).rejects.toBeInstanceOf(CustomHttpException);
    });
  });

  // -------------------- Resumen para ADMIN --------------------

  describe('getAdminSummary', () => {
    const buildQbMock = (payments: any[]) => {
      return {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(payments),
      };
    };

    it('It throws an error if the startDate format is invalid', async () => {
      const qb = buildQbMock([]);
      paymentRepo.createQueryBuilder.mockReturnValue(qb);

      await expect(
        service.getAdminSummary({ startDate: 'bad-date' }),
      ).rejects.toBeInstanceOf(CustomHttpException);
    });

    it('returns aggregated totals correctly', async () => {
      const payments = [
        {
          idPayment: 1,
          trip: { idTrip: 1 },
          amount: 40000,
          adminShare: 4000,
          driverShare: 24000,
          ownerShare: 12000,
          paymentDate: new Date(),
          paymentStatus: PaymentStatus.COMPLETED,
        },
        {
          idPayment: 2,
          trip: { idTrip: 2 },
          amount: 60000,
          adminShare: 6000,
          driverShare: 36000,
          ownerShare: 18000,
          paymentDate: new Date(),
          paymentStatus: PaymentStatus.COMPLETED,
        },
      ];

      const qb = buildQbMock(payments);
      paymentRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getAdminSummary({});

      expect(paymentRepo.createQueryBuilder).toHaveBeenCalledWith('payment');
      expect(result.success).toBe(true);
      expect(result.totalPayments).toBe(2);
      expect(result.totalAmount).toBe(100000);
      expect(result.totalAdminShare).toBe(10000);
      expect(result.totalDriverShare).toBe(60000);
      expect(result.totalOwnerShare).toBe(30000);
      expect(result.data.length).toBe(2);
    });
  });
});
