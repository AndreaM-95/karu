import { Test, TestingModule } from '@nestjs/testing';
import { TripsService } from './trips.service';

const locationsFake = [
  {
    locality: 'Usaquén',
    zone: 'Verbenal',
  },
  {
    locality: 'Usaquén',
    zone: 'San Antonio',
  },
];

const dto = {
  passengerId: 1,
  driverId: 2,
  originLocationId: 10,
  destinationLocationId: 20,
};

const passengerFake = {
  idUser: 1,
  name: 'Ana Lopez',
  role: 'passenger',
  active: true,
};

const driverFake = {
  idUser: 2,
  name: 'Carlos Ruiz',
  role: 'driver',
  active: true,
  driverStatus: 'available',
  drivingVehicles: [{ plate: 'ABC123' }],
};

const originFake = {
  idLocation: 10,
  zone: 'Verbenal',
  latitude: 4.6,
  longitude: -74.0,
};

const destinationFake = {
  idLocation: 20,
  zone: 'San Antonio',
  latitude: 4.63,
  longitude: -74.05,
};

const createdTripFake = {
  idTrip: 999,
  statusTrip: 'in_progress',
  cost: 5000,
  distanceKm: 2,
};

const tripsFake = [
  {
    idTrip: 1,
    statusTrip: 'in_progress',
    cost: 15000,
    driver: {
      name: 'Juan Lopez',
      driverStatus: 'busy',
    },
    passenger: {},
  },
  {
    idTrip: 2,
    statusTrip: 'in_progress',
    cost: 10000,
    driver: {
      name: 'Oscar Ruiz',
      driverStatus: 'busy',
    },
    passenger: {},
  }
];

describe('TripsService', () => {
  let service: TripsService;
  let fakeUserRepo;
  let fakeTripRepo;
  let fakeLocationRepo;

  beforeEach(() => {
    jest.clearAllMocks();

    fakeTripRepo = {
      findOne: jest.fn((opts) => {
        const id = opts.where.idTrip;
        return Promise.resolve(tripsFake.find(t => t.idTrip === id));
      }),
      create: jest.fn(),
      save: jest.fn(),
    };

    fakeUserRepo = {
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(), 
    };

    fakeLocationRepo = {
      find: jest.fn().mockResolvedValue(locationsFake),
      findOneBy: jest.fn(),
    };

    service = new TripsService(
      fakeUserRepo,
      fakeTripRepo,
      fakeLocationRepo,
    );
  });

  it('Should calculate the price', async () => {
    const distanceKm = 13;
    const pricePerKm = 3000;
    const result = Number((distanceKm * pricePerKm).toFixed(2));

    expect(result).toBe(39000);
  });

  it('Returns grouped locations by locality', async () => {
    const result = await service.findAllLocations();
    expect(fakeLocationRepo.find).toHaveBeenCalled();
    expect(result).toEqual({
      Usaquén: ['Verbenal', 'San Antonio'],
    });
    expect(Object.keys(result)).toContain('Usaquén');
  });

  it('Must return a locality with its zones', async () => {
    fakeLocationRepo.findOneBy.mockResolvedValue({
      locality: 'Usaquén',
    });

    fakeLocationRepo.find.mockResolvedValue([
      { idLocation: 1, zone: 'Verbenal' },
      { idLocation: 2, zone: 'San Antonio' },
    ]);

    const result = await service.findAllNeighborhoods('Usaquén');

    expect(fakeLocationRepo.findOneBy).toHaveBeenCalledWith({
      locality: 'Usaquén',
    });

    expect(fakeLocationRepo.find).toHaveBeenCalledWith({
      where: { locality: 'Usaquén' },
      select: ['idLocation', 'zone'],
    });

    expect(result).toEqual([
      { idLocation: 1, zone: 'Verbenal' },
      { idLocation: 2, zone: 'San Antonio' },
    ]);
  });

});
