import { Test, TestingModule } from '@nestjs/testing';
import { TripsService } from './trips.service';
import { UserRole } from '../users/entities/User.entity';

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

  it('Should display the authenticated users travel history', async () => {
    const fakeUserFromToken = { idUser: 10 };
    const fakeUserInfo: any = {
      idUser: 10,
      role: UserRole.PASSENGER,
      passengerTrips: [
        { idTrip: 1, origin: 'A', destination: 'B' },
        { idTrip: 2, origin: 'C', destination: 'D' },
      ],
      driverTrips: [],
    };

    fakeUserRepo.findOne.mockResolvedValue(fakeUserInfo);
    const result = await service.getUserTripHistory(fakeUserFromToken);

    expect(fakeUserRepo.findOne).toHaveBeenCalledWith({
      where: { idUser: 10 },
      relations: ['passengerTrips', 'driverTrips'],
    });

    expect(result?.role).toBe("PASSENGER");
    expect(result?.totalTrips).toBe(2);
    expect(result?.trips.length).toBe(2);
  });

  it('Should create a trip', async () => {
    fakeUserRepo.findOneBy.mockResolvedValueOnce(passengerFake);
    fakeUserRepo.findOne.mockResolvedValueOnce(driverFake);

    fakeLocationRepo.findOneBy
      .mockResolvedValueOnce(originFake)
      .mockResolvedValueOnce(destinationFake);

    fakeTripRepo.findOne.mockResolvedValueOnce(null);

    fakeTripRepo.create.mockReturnValue(createdTripFake);
    fakeTripRepo.save.mockResolvedValue(createdTripFake);

    fakeUserRepo.save.mockResolvedValue({ ...driverFake, driverStatus: 'busy' });
    
    const result = await service.createTrip(dto);

    expect(fakeUserRepo.findOneBy).toHaveBeenCalledWith({ idUser: 1 });
    expect(fakeUserRepo.findOne).toHaveBeenCalledWith({
      where: { idUser: 2 },
      relations: ['drivingVehicles'],
    });

    expect(fakeTripRepo.create).toHaveBeenCalled();
    expect(fakeTripRepo.save).toHaveBeenCalled();

    expect(result.message).toBe('Trip successfully requested.');
    expect(result.trip.passenger).toBe('Ana Lopez');
    expect(result.trip.driver).toBe('Carlos Ruiz');
    expect(result.trip.vehicle).toBe('ABC123');
  });

  it('Should calculate the price', async () => {
    const distanceKm = 13;
    const pricePerKm = 3000;
    const result = Number((distanceKm * pricePerKm).toFixed(2));

    expect(result).toBe(39000);
  });

  it('Should throw exception when DRIVER has no trips', async () => {
    const fakeUserFromToken = { idUser: 10 };

    const fakeUser = {
      idUser: 10,
      role: UserRole.DRIVER,
      driverTrips: [],
    };
    
    fakeUserRepo.findOne.mockResolvedValue(fakeUser);

    await expect(service.getUserTripHistory(fakeUserFromToken))
      .rejects
      .toThrow('No trips have been made.');
  });

  it('Should finish a trip', async () => {
    fakeUserRepo.save = jest.fn().mockResolvedValue(tripsFake[1].driver);
    fakeTripRepo.save = jest.fn();

    const result = await service.completeTrip(2);

    expect(fakeTripRepo.findOne).toHaveBeenCalledWith({
      where: { idTrip: 2 },
      relations: ['driver', 'passenger'],
    });

    expect(tripsFake[1].statusTrip).toBe('completed');
    expect(tripsFake[1].driver.driverStatus).toBe('available');
  });

  it('Should cancel a trip', async () => {
    fakeUserRepo.save = jest.fn().mockResolvedValue(tripsFake[0].driver);
    fakeTripRepo.save = jest.fn();

    const result = await service.cancelTrip(1);

    expect(fakeTripRepo.findOne).toHaveBeenCalledWith({
      where: { idTrip: 1 },
      relations: ['driver', 'passenger'],
    });

    expect(tripsFake[0].statusTrip).toBe('canceled');
    expect(tripsFake[0].driver.driverStatus).toBe('available');
  });
});
