import { Test, TestingModule } from '@nestjs/testing';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { TripStatus } from './entities/trip.entity';
import { UserRole } from '../users/entities/User.entity';

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
});
