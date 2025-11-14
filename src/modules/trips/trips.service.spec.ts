import { Test, TestingModule } from '@nestjs/testing';
import { TripsService } from './trips.service';

const locationsFake = [
  {
    idLocation: 1,
    locality: 'Usaquén',
    zone: 'Verbenal',
    latitude: 4.6840459057,
    longitude: -74.0629262275,
  },
  {
    idLocation: 2,
    locality: 'Usaquén',
    zone: 'San Antonio',
    latitude: 4.6840459057,
    longitude: -74.0629262275,
  },
];

const vehiclesFake = [];

const tripsFake = [];

describe('TripsService', () => {
  let service: TripsService;
  let fakeTripRepo;
  let fakeLocationRepo;
  let fakeVehicleRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    fakeLocationRepo = {
      find: jest.fn().mockResolvedValue(locationsFake),
      findOneBy: jest.fn().mockResolvedValue(locationsFake),
    };
    fakeVehicleRepo = {
      find: jest.fn().mockResolvedValue(vehiclesFake),
    };
    fakeTripRepo = {
      find: jest.fn().mockResolvedValue(tripsFake),
    };

    service = new TripsService(
      fakeTripRepo as any,
      fakeLocationRepo as any,
      fakeVehicleRepo as any,
    );
  });

  it('Returns all locations', async () => {
    const locations = await service.findAllLocations();
    expect(locations.length).toBeGreaterThan(0);
    expect(fakeLocationRepo.find).toHaveBeenCalled();
  });
});
