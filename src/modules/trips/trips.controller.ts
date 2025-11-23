import {
  Controller,
  Get,
  Param,
  Request,
  Post,
  Body,
  Put,
  ParseIntPipe,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDTO } from './dto/create-trip.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UserRole } from '../users/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Trips')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/api/trips')
export class TripsController {
  private readonly logger = new Logger(TripsController.name);
  constructor(private readonly tripsService: TripsService ) {}

  @Get('locations')
  @ApiOperation({ summary: 'Localities with each area or neighborhood' })
  @ApiResponse({ status: 200, description: 'Object of each locality with its zones or neighborhoods' })
  findAllLocations() {
    this.logger.debug('Find all the localities and neighborhoods');
    return this.tripsService.findAllLocations();
  }

  @Get('locations/:locality')
  @ApiOperation({ summary: 'Locality with its zones or neighborhoods' })
  @ApiResponse({ status: 200, description: 'Object of a locality with its zones or neighborhoods' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  findAllNeighborhoods(@Param('locality') locality: string) {
    this.logger.debug(`Neighborhoods found for the locality: ${locality}`);
    return this.tripsService.findAllNeighborhoods(locality);
  }

  @Get('my-trips')
  @ApiOperation({ summary: 'Authenticated user travel history' })
  @ApiResponse({ status: 200, description: 'Trips history' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 404, description: 'No trips have been made' })
  @Roles(UserRole.OWNER, UserRole.DRIVER, UserRole.PASSENGER)
  async getUserTripHistory(@Request() req) {
    this.logger.debug("Find the user's trips");
    return this.tripsService.getUserTripHistory(req.user);
  }

  @Post('request-trip')
  @ApiOperation({ summary: 'Create a trip' })
  @ApiResponse({ status: 201, description: 'Trip successfully requested' })
  @ApiResponse({ status: 400, description: 'User is not a passenger' })
  @ApiResponse({ status: 400, description: 'Driver is not available' })
  @ApiResponse({ status: 400, description: 'Invalid origin or destination' })
  @ApiResponse({ status: 400, description: 'Origin and destination cannot be the same' })
  @ApiResponse({ status: 400, description: 'Passenger already has an active trip' })
  @Roles(UserRole.PASSENGER)
  async createTrip(@Request() req, @Body() dto: CreateTripDTO) {
    this.logger.debug(`Trip requested by passenger with token ID: ${req.user.idUser}`);
    return this.tripsService.createTrip(req.user, dto);
  }


  @Put('complete-trip/:tripId')
  @ApiOperation({ summary: 'End a trip' })
  @ApiResponse({ status: 200, description: 'Trip successfully completed' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  @ApiResponse({ status: 400, description: 'Trip already canceled' })
  @ApiResponse({ status: 400, description: 'Trip already completed' })
  @ApiResponse({ status: 400, description: 'Trip cannot be completed at this stage' })
  @Roles(UserRole.DRIVER, UserRole.PASSENGER)
  async completeTrip(@Param('tripId', ParseIntPipe) tripId: number) {
    this.logger.debug(`Completing trip with ID: ${tripId}`);
    return this.tripsService.completeTrip(tripId);
  }

  @Put('cancel-trip/:tripId')
  @ApiOperation({ summary: 'Cancel a trip' })
  @ApiResponse({ status: 200, description: 'Trip has been canceled' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  @ApiResponse({ status: 400, description: 'Trip already canceled' })
  @ApiResponse({ status: 400, description: 'A completed trip cannot be canceled' })
  @Roles(UserRole.DRIVER, UserRole.PASSENGER)
  async cancelTrip(@Param('tripId', ParseIntPipe) tripId: number) {
    this.logger.debug(`Canceling trip with ID: ${tripId}`);
    return this.tripsService.cancelTrip(tripId);
  }
}
