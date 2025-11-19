import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: jest.Mocked<PaymentsService>;

  beforeEach(async () => {
    const mockService: Partial<jest.Mocked<PaymentsService>> = {
      createPaymentFromTrip: jest.fn(),
      getPassengerPaymentHistory: jest.fn(),
      getUserEarningsByTrip: jest.fn(),
      getAdminSummary: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    service = module.get(PaymentsService) as jest.Mocked<PaymentsService>;
  });

  it('must be defined', () => {
    expect(controller).toBeDefined();
  });

  it('createPaymentFromTrip delegates to the service with the passenger id', async () => {
    const dto: any = { tripId: 1, paymentMethod: 'cash' };
    const req: any = { user: { idUser: 10 } };
    const mockResponse = { success: true } as any;

    service.createPaymentFromTrip.mockResolvedValue(mockResponse);

    const result = await controller.createPaymentFromTrip(dto, req);

    expect(service.createPaymentFromTrip).toHaveBeenCalledWith(
      dto,
      req.user.idUser,
    );
    expect(result).toBe(mockResponse);
  });

  it('getPassengerPaymentHistory uses the authenticated passenger id', async () => {
    const req: any = { user: { idUser: 10 } };
    const query: any = { page: 1, limit: 10 };
    const mockResponse = { success: true, total: 0, data: [] } as any;

    service.getPassengerPaymentHistory.mockResolvedValue(mockResponse);

    // OJO: el orden aquí respeta la firma real del controller (query, req)
    const result = await controller.getPassengerPaymentHistory(query, req);

    expect(service.getPassengerPaymentHistory).toHaveBeenCalledWith(
      req.user.idUser,
      query,
    );
    expect(result).toBe(mockResponse);
  });

  it('getUserEarningsByTrip sends the complete user to the service', async () => {
    const req: any = { user: { idUser: 99, role: 'driver' } };
    const query: any = { page: 1 };
    const mockResponse = { success: true } as any;

    service.getUserEarningsByTrip.mockResolvedValue(mockResponse);

    const result = await controller.getUserEarningsByTrip(query, req);

    expect(service.getUserEarningsByTrip).toHaveBeenCalledWith(
      req.user,
      query,
    );
    expect(result).toBe(mockResponse);
  });

  it('getAdminSummary correctly passes the date filters', async () => {
    const mockResponse = { success: true } as any;

    service.getAdminSummary.mockResolvedValue(mockResponse);

    const result = await controller.getAdminSummary('2025-11-01', '2025-11-30');

    expect(service.getAdminSummary).toHaveBeenCalledWith({
      startDate: '2025-11-01',
      endDate: '2025-11-30',
    });
    expect(result).toBe(mockResponse);
  });
});
