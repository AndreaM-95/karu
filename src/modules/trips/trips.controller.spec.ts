import { Test, TestingModule } from '@nestjs/testing';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { TripStatus } from './entities/trip.entity';
import { UserRole } from '../users/entities/user.entity';

const locationsFake = [
  { idLocation: 10, locality: 'Usaquén', zone: 'Verbenal', latitude: 4.6, longitude: -74.0, },
  { idLocation: 20, locality: 'Usaquén', zone: 'San Antonio', latitude: 4.63, longitude: -74.05, },
  { idLocation: 20, locality: 'Suba', zone: 'Cañiza', latitude: 4.63, longitude: -74.05, },
];

const locationsRecord = {
  Usaquén: ['Verbenal', 'San Antonio'],
  Suba: ['Laureles', 'Cañiza'],
};

describe('TripsController', () => {
  let controller: TripsController;
  let service: jest.Mocked<TripsService>;

  beforeEach(() => {
    service = {
      findAllLocations: jest.fn(),
      findAllNeighborhoods: jest.fn(),
      getUserTripHistory: jest.fn(),
      createTrip: jest.fn(),
      completeTrip: jest.fn(),
      cancelTrip: jest.fn(),
    } as any;

    controller = new TripsController(service);
  });

  it('Should return localities and neighborhoods', async () => {
    service.findAllLocations.mockResolvedValue(locationsRecord);
    const locationsUser = await controller.findAllLocations();
    expect(typeof locationsUser).toBe('object');
    expect(Object.keys(locationsUser).length).toBeGreaterThan(0);
    expect(locationsUser).toEqual(locationsRecord);
  });

  it('Should return user trip history', async () => {
    const fakeReq: any = {
      user: {
        idUser: 20,
        role: UserRole.PASSENGER,
      },
    };

    const fakeResponseUser: any = {
      role: 'PASSENGER',
      totalTrips: 2,
      trips: [
        { idTrip: 1 },
        { idTrip: 2 },
      ],
    };
    service.getUserTripHistory.mockResolvedValue(fakeResponseUser);
    const result = await controller.getUserTripHistory(fakeReq);
    expect(service.getUserTripHistory).toHaveBeenCalledWith(fakeReq.user);
    expect(result).toEqual(fakeResponseUser);
  });

  it('Should create a trip', async () => {
    const fakeReq = {
      user: { idUser: 1 }, // tomado del token
    };

    const cost = 20000;
    const fakeTrip = {
      message: 'Trip successfully requested.',
        trip: {
          idTrip: 1,
          passenger: 'Andrea',
          driver: 'Carlos',
          vehicle: 'ABC123',
          origin: 'Verbenal',
          destination: 'Suba',
          distanceKm: 12,
          price: `COP $ ${cost}`,
          status: TripStatus.INPROGRESS,
        },
      };

    service.createTrip.mockResolvedValue(fakeTrip);

    const result = await controller.createTrip(fakeReq as any, {} as any);

    expect(result.trip.idTrip).toBe(1);
    expect(result.message).toEqual('Trip successfully requested.');
  });


  it('Should complete a trip', async () => {
    const costTrip = 20000;
    const fakeComplete = {
      message: 'Trip successfully completed.',
      trip: {
        idTrip: 1,
        distanceKm: 12,
         price: `COP $ ${costTrip}`,
        driver: 'Juan',
        passenger: 'Luna',
      },
    };

    service.completeTrip.mockResolvedValue(fakeComplete);

    const result = await controller.completeTrip(1);
    expect(result.trip.idTrip).toBe(1);
    expect(result.trip.driver).toBe('Juan');
  });

  it('Should cancel a trip', async () => {
    const fakeCancel = {
      message: 'Trip has been canceled.',
      tripId: 1,
      driverAvailable: 'Carlos',
      cost: 15000,
    };

    service.cancelTrip.mockResolvedValue(fakeCancel);

    const result = await controller.cancelTrip(1);
    expect(result.message).toBe('Trip has been canceled.');
  });
});
