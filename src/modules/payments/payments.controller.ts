import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentFromTripDto } from './dto/create-payment-from-trip.dto';
import { PassengerPaymentHistoryQueryDto } from './dto/passenger-payment-history-query.dto';
import { EarningsQueryDto } from './dto/earnings-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  // -------------------- HU-01: Register payment for completed trip --------------------
  @Post('from-trip')
  @ApiOperation({
    summary: 'Register payment for a completed trip',
    description:
      'Registers the payment associated with a trip in COMPLETED status and calculates the payment distribution (10% admin, 90% between driver and owner).',
  })
  @ApiResponse({ status: 201, description: 'Payment registered successfully' })
  @ApiResponse({
    status: 400,
    description:
      'Validation error: trip does not exist, is not completed, or already has a registered payment',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized: invalid JWT token' })
  async createPaymentFromTrip(
    @Body() dto: CreatePaymentFromTripDto,
    @Request() req,
  ) {
    this.logger.log(
      `POST /payments/from-trip by userId=${req.user?.idUser}, tripId=${dto.tripId}`,
    );
    return this.paymentsService.createPaymentFromTrip(dto, req.user.idUser);
  }

  // -------------------- HU-02: Get payment history for authenticated passenger --------------------
  @Get('me/history')
  @ApiOperation({
    summary: 'Get payment history of authenticated passenger',
    description:
      'Returns the payment history of the authenticated passenger with pagination.',
  })
  @ApiResponse({ status: 200, description: 'List of payments of the passenger' })
  @ApiResponse({ status: 401, description: 'Unauthorized: invalid JWT token' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async getPassengerPaymentHistory(
    @Query() query: PassengerPaymentHistoryQueryDto,
    @Request() req,
  ) {
    this.logger.log(
      `GET /payments/me/history by userId=${req.user?.idUser}, page=${query.page}, limit=${query.limit}`,
    );
    return this.paymentsService.getPassengerPaymentHistory(req.user.idUser, query);
  }

  // -------------------- HU-04: Get user earnings per trip --------------------
  @Get('me/earnings')
  @ApiOperation({
    summary: 'Get how much corresponds to the authenticated user per trip',
    description:
      'Returns, for the authenticated user, the amount corresponding to them per trip based on their role (driver, owner, or admin), with optional filters by date and status.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of amounts per trip for the authenticated user',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized: invalid JWT token' })
  @ApiResponse({ status: 403, description: 'Role not allowed for this service' })
  @ApiQuery({ name: 'startDate', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2025-01-31' })
  @ApiQuery({ name: 'status', required: false, example: 'COMPLETED' })
  async getUserEarningsByTrip(
    @Query() query: EarningsQueryDto,
    @Request() req,
  ) {
    this.logger.log(
      `GET /payments/me/earnings by userId=${req.user?.idUser}, role=${req.user?.role}`,
    );
    return this.paymentsService.getUserEarningsByTrip(req.user, query);
  }

  // -------------------- Admin: General payment summary --------------------
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/summary')
  @ApiOperation({
    summary: 'Get general payment summary for administrator',
    description:
      'Returns all payments with their distribution per trip and aggregated totals for the administrator.',
  })
  @ApiResponse({ status: 200, description: 'Payment summary' })
  @ApiResponse({ status: 401, description: 'Unauthorized: invalid JWT token' })
  @ApiResponse({ status: 403, description: 'Only administrator can access this summary' })
  @ApiQuery({ name: 'startDate', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2025-01-31' })
  async getAdminSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    this.logger.log(
      `GET /payments/admin/summary with startDate=${startDate}, endDate=${endDate}`,
    );
    return this.paymentsService.getAdminSummary({ startDate, endDate });
  }
}


