import { Test, TestingModule } from '@nestjs/testing';
import { RatingsService } from '../ratings.service';
import { Status } from '../entities/rating.entity';
import { DriverStatus, UserRole } from '../../users/entities/user.entity';
import { LessThan } from 'typeorm';
import { CustomHttpException } from 'src/common/exceptions/custom-http.exception';

const fakeUser = {
  idUser: 1,
  role: UserRole.DRIVER,
  driverStatus: 'ONLINE',
};

const fakeRatings = [
  { id: 1, stars: 5, comment: 'Excellent service' },
  { id: 2, stars: 3, comment: 'Normal' },
  { id: 3, stars: 4, comment: 'Normal' },
];

describe('RatingsService', () => {
  let service: RatingsService;
  let fakeRatingRepo;
  let fakeUserRepo;
  let fakeTripRepo;

  beforeEach(() => {
    jest.clearAllMocks();

    fakeRatingRepo = {
      find: jest.fn().mockResolvedValue(fakeRatings),
      findOne: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    fakeUserRepo = {
      save: jest.fn(),
    };

    fakeTripRepo = {
      findOne: jest.fn(),
    };

    service = new RatingsService(fakeRatingRepo, fakeUserRepo, fakeTripRepo);
  });

  it('Should return all the ratings', async () => {
    const result = await service.adminGetAllRatings();

    expect(fakeRatingRepo.find).toHaveBeenCalledWith({
      relations: ['author', 'target', 'tripId'],
      order: { createdAt: 'DESC' },
    });

    expect(result.length).toBe(3);
    expect(result).toEqual(fakeRatings);
  });

  it('Should return a rating by ID', async () => {
    const fakeRating = {
      idRating: 10,
      score: 5,
      comments: 'Great',
    };

    fakeRatingRepo.findOne.mockResolvedValue(fakeRating);
    const result = await service.adminGetRatingById(10);
    expect(fakeRatingRepo.findOne).toHaveBeenCalledWith({
      where: { idRating: 10 },
      relations: ['author', 'target', 'tripId'],
    });
    expect(result).toEqual(fakeRating);
  });

  it('Should throw if the rating does not exist', async () => {
    fakeRatingRepo.findOne.mockResolvedValue(null);

    await expect(service.adminGetRatingById(99)).rejects.toThrow(
      'Rating not found',
    );
  });

  it('Should return 0 if user has no ratings', async () => {
    fakeRatingRepo.find.mockResolvedValue([]);

    const result = await service.calculateUserAverage(10);

    expect(fakeRatingRepo.find).toHaveBeenCalledWith({
      where: { target: { idUser: 10 }, status: 'rated' },
    });

    expect(result).toBe(0);
  });

  it('Should calculate the user average rating', async () => {
    const fakeRatings = [{ score: 5 }, { score: 3 }, { score: 4 }];

    fakeRatingRepo.find.mockResolvedValue(fakeRatings);

    const result = await service.calculateUserAverage(20);

    expect(fakeRatingRepo.find).toHaveBeenCalledWith({
      where: { target: { idUser: 20 }, status: 'rated' },
    });

    expect(result).toBe(4);
  });

  it('Should create a rating successfully', async () => {
    const dto = { tripId: 1, score: 5, comments: 'Excelente' };
    const fakeUser = { idUser: 10, name: 'Alice' };
    const fakeTrip = {
      idTrip: 1,
      driver: { idUser: 10, name: 'Alice' },
      passenger: { idUser: 20, name: 'Bob' },
    };

    // Mocks de las validaciones
    service.validateTripExists = jest.fn().mockResolvedValue(fakeTrip);
    service.validateTripIsRateable = jest.fn();
    service.validateUser = jest.fn();
    service.validateTime = jest.fn();
    service.validateNoPreviousRating = jest.fn();

    // Target = passenger (porque autor = driver)
    const fakeCreated = {
      idRating: 1,
      score: 5,
      comments: 'Excelente',
    };

    fakeRatingRepo.create.mockReturnValue(fakeCreated);
    fakeRatingRepo.save.mockResolvedValue(fakeCreated);
    service.blockUser = jest.fn().mockResolvedValue(true);
    const result = await service.createRating(dto, fakeUser as any);

    expect(service.validateTripExists).toHaveBeenCalledWith(1);
    expect(service.validateNoPreviousRating).toHaveBeenCalledWith(1, 10);
    expect(fakeRatingRepo.create).toHaveBeenCalledWith({
      score: 5,
      comments: 'Excelente',
      author: fakeUser,
      target: fakeTrip.passenger,
      tripId: fakeTrip,
      status: Status.RATED,
    });

    expect(fakeRatingRepo.save).toHaveBeenCalledWith(fakeCreated);
    expect(service.blockUser).toHaveBeenCalledWith(fakeTrip.passenger);
    expect(result).toEqual({
      message: 'Rating successfully submitted',
      rating: {
        idRating: 1,
        score: 5,
        comments: 'Excelente',
        targetUser: 'Bob',
      },
    });
  });

  it('Should block a user with 5 or more low ratings', async () => {
    fakeRatingRepo.count.mockResolvedValue(5); //5 ratings bad
    fakeUserRepo.save.mockResolvedValue(true);
    await service.blockUser(fakeUser as any);

    expect(fakeRatingRepo.count).toHaveBeenCalledWith({
      where: {
        target: { idUser: 1 },
        score: LessThan(3),
      },
    });
    expect(fakeUser.driverStatus).toBe(DriverStatus.OFFLINE);
    expect(fakeUserRepo.save).toHaveBeenCalledWith(fakeUser);
  });

  it('Should throw if user role is not DRIVER or PASSENGER', async () => {
    const fakeUser: any = {
      idUser: 50,
      role: 'ADMIN',
    };

    await expect(service.getMyRatings(fakeUser)).rejects.toThrow(
      'Only drivers and passengers can view ratings',
    );
  });

  it('Should block passenger when low ratings >= 5', async () => {
    const passengerUser: any = {
      idUser: 30,
      role: 'passenger',
      active: true,
    };

    fakeRatingRepo.count.mockResolvedValue(5);
    fakeUserRepo.save.mockResolvedValue(passengerUser);

    await service.blockUser(passengerUser);

    expect(passengerUser.active).toBe(false);
    expect(fakeUserRepo.save).toHaveBeenCalledWith(passengerUser);
  });

  it('Should throw if user already rated this trip', async () => {
    fakeRatingRepo.findOne.mockResolvedValue({ idRating: 1 }); // existe rating previo

    await expect(service.validateNoPreviousRating(10, 20)).rejects.toThrow(
      'You already rated this trip',
    );

    expect(fakeRatingRepo.findOne).toHaveBeenCalledWith({
      where: {
        tripId: { idTrip: 10 },
        author: { idUser: 20 },
      },
    });
  });

  it('Should fetch ratings for a valid driver or passenger', async () => {
    const user: any = {
      idUser: 50,
      role: 'passenger',
    };

    const fakeRatings = [
      { idRating: 1, score: 5, comments: 'Nice', createdAt: '2024-01-01' },
    ];

    fakeRatingRepo.find.mockResolvedValue(fakeRatings);
    jest.spyOn(service, 'calculateUserAverage').mockResolvedValue(5);

    const result = await service.getMyRatings(user);

    expect(fakeRatingRepo.find).toHaveBeenCalledWith({
      where: {
        target: { idUser: 50 },
        status: 'rated',
      },
      order: { createdAt: 'DESC' },
    });

    expect(result.total).toBe(1);
    expect(result.miAverage).toBe(5);
  });

  it('should throw CustomHttpException if more than 24h have passed', () => {
    const oldTrip: any = {
      idTrip: 99,
      requestedAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
    };

    expect(() => service.validateTime(oldTrip)).toThrow(CustomHttpException);
  });

  });