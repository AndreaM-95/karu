import { Rating, Status } from './entities/rating.entity';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';

const fakeRatings: Rating[] = [
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

  it('Should return my ratings', async () => {
    const fakeReq = {
      user: {
        idUser: 4,
        role: 'PASSENGER'
      }
    };

    const fakeResponse = {
      total: 2,
      miAverage: 4,
      ratings: [
        { idRating: 1, score: 5, comments: 'Excellent service', createdAt: new Date() },
        { idRating: 2, score: 3, comments: 'Normal', createdAt: new Date() },
      ]
    };

    service.getMyRatings.mockResolvedValue(fakeResponse);

    const result = await controller.getMyRatings(fakeReq as any);

    expect(service.getMyRatings).toHaveBeenCalledWith(fakeReq.user);
    expect(result.total).toBe(2);
    expect(result.miAverage).toBe(4);
    expect(result.ratings.length).toBe(2);
  });


  it('Should crear one rating', async () => {
    const fakeRating: any = {
      message: 'Rating successfully submitted',
      rating: {
        idRating: 4,
        score: 3,
        comments: 'Normal',
        createdAt: new Date(),
        status: Status.NOTRATED,
        tripId: { idTrip: 3 } as any,
        author: { idUser: 4 } as any,
        target: { idUser: 4 } as any,
      }
    };

    const fakeReq = {
      user: {
        idUser: 4,
        role: 'PASSENGER'
      }
    };

    service.createRating.mockResolvedValue(fakeRating);
    const result = await controller.createRating({} as any, fakeReq as any);
    expect(result.rating.idRating).toBe(4);
    expect(result.message).toEqual('Rating successfully submitted');
  });

});
