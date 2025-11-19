import { Test, TestingModule } from '@nestjs/testing';
import { RatingsService } from './ratings.service';
import { Status } from './entities/rating.entity';
import { DriverStatus, UserRole } from '../users/entities/user.entity';
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

  });