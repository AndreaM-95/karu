import { rating, Status } from './entities/rating.entity';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';

const fakeRatings: rating[] = [
  {
    idRating: 1,
    score: 5,
    comments: 'Excellent service',
    createdAt: new Date(),
    status: Status.NOTRATED,
    tripId: { idTrip: 1 } as any,
    author: { idUser: 5 } as any,
    target: { idUser: 5 } as any,
  },
  {
    idRating: 2,
    score: 4,
    comments: 'Good service',
    createdAt: new Date(),
    status: Status.NOTRATED,
    tripId: { idTrip: 1 } as any,
    author: { idUser: 5 } as any,
    target: { idUser: 5 } as any,
  },
];

describe('RatingsController', () => {
  let controller: RatingsController;
  let service: jest.Mocked<RatingsService>;

  beforeEach(() => {
    service = {
      adminGetAllRatings: jest.fn(),
      adminGetRatingById: jest.fn(),
      getMyRatings: jest.fn(),
      createRating: jest.fn(),
    } as any;

    controller = new RatingsController(service);
  });

  it('Should return all the ratings', async () => {
    service.adminGetAllRatings.mockResolvedValue(fakeRatings);
    const ratings = await controller.adminGetAllRatings();

    expect(ratings.length).toBeGreaterThan(0);
    expect(ratings).toEqual(fakeRatings);
  });
  
  it('Should return one rating', async () => {
    service.adminGetRatingById.mockResolvedValue(fakeRatings[0]);
    const rating = await controller.adminGetRatingById(1);

    expect(rating.idRating).toEqual(1);
    expect(rating.score).toEqual(5);
  });

});
