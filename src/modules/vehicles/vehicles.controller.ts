import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiParam,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBody,
} from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { AssignDriverDto } from './dto/assing-driver.dto';
import { QueryVehicleDto } from './dto/query-vehicle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { VehicleResponseDto } from './dto/vehicle-response.dto';

/**
 * Vehicles Controller
 * Handles all vehicle-related endpoints including creation, assignment,
 * queries, statistics, and status updates
 */
@ApiTags('Vehicles')
@ApiBearerAuth()
@Controller('vehicles')
export class VehiclesController {
  private readonly logger = new Logger(VehiclesController.name);

  constructor(private readonly vehiclesService: VehiclesService) {}

  /**
   * Creates a new vehicle
   * Owners can create vehicles for themselves
   * Admins can create vehicles for any owner
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({
    summary: 'Create a new vehicle',
    description:
      'Creates a new vehicle. Owners can only create vehicles for themselves. ' +
      'Admins can create vehicles for any owner by specifying ownerId.',
  })
  @ApiBody({ type: CreateVehicleDto })
  @ApiResponse({
    status: 201,
    description: 'Vehicle created successfully with owner information.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid vehicle data, plate already exists, or user is not an owner.',
  })
  @ApiUnauthorizedResponse({
    description: 'Not authenticated or invalid token.',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to create vehicles.',
  })
  @ApiNotFoundResponse({
    description: 'Owner not found.',
  })
  create(@Body() dto: CreateVehicleDto, @Req() req: any) {
    this.logger.log(
      `POST /vehicles - Create vehicle request by user ID: ${req.user.idUser}`,
    );
    return this.vehiclesService.createVehicle(dto, req.user);
  }

  /**
   * Assigns a driver to a vehicle
   * Only administrators can perform this action
   */
  @Post('assign-driver')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Assign a driver to a vehicle (Admin only)',
    description:
      'Assigns a driver to a vehicle. Prevents duplicate assignments. ' +
      'Only users with driver role can be assigned.',
  })
  @ApiBody({ type: AssignDriverDto })
  @ApiResponse({
    status: 200,
    description: 'Driver assigned successfully to vehicle.',
  })
  @ApiBadRequestResponse({
    description: 'User is not a driver or already assigned to this vehicle.',
  })
  @ApiNotFoundResponse({
    description: 'Vehicle or driver not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Not authenticated or invalid token.',
  })
  @ApiForbiddenResponse({
    description: 'Only administrators can assign drivers.',
  })
  assignDriver(@Body() dto: AssignDriverDto) {
    this.logger.log(
      `POST /vehicles/assign-driver - Assign driver ${dto.driverId} to vehicle ${dto.vehicleId}`,
    );
    return this.vehiclesService.assignDriver(dto);
  }

  /**
   * Retrieves all vehicles with optional filters
   * Supports filtering by brand, model, status, type, owner, driver, and plate
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all vehicles with optional filters (Admin only)',
    description:
      'Retrieves all vehicles with support for multiple filters. ' +
      'Returns sanitized vehicle data including owner and drivers information.',
  })
  @ApiQuery({
    name: 'brand',
    required: false,
    description: 'Filter by vehicle brand (partial match, case-insensitive)',
    example: 'Toyota',
  })
  @ApiQuery({
    name: 'model',
    required: false,
    description: 'Filter by vehicle model (partial match, case-insensitive)',
    example: 'Corolla',
  })
  @ApiQuery({
    name: 'statusVehicle',
    required: false,
    description: 'Filter by vehicle status',
    enum: ['active', 'inactive', 'maintenance'],
  })
  @ApiQuery({
    name: 'vehicleType',
    required: false,
    description: 'Filter by vehicle type',
    enum: ['car', 'motorcycle', 'van'],
  })
  @ApiQuery({
    name: 'ownerId',
    required: false,
    type: Number,
    description: 'Filter by owner ID',
  })
  @ApiQuery({
    name: 'driverId',
    required: false,
    type: Number,
    description: 'Filter by assigned driver ID',
  })
  @ApiQuery({
    name: 'plate',
    required: false,
    description: 'Filter by plate number (partial match, case-insensitive)',
    example: 'ABC123',
  })
  @ApiResponse({
    status: 200,
    description: 'List of vehicles matching the filters.',
  })
  @ApiUnauthorizedResponse({
    description: 'Not authenticated or invalid token.',
  })
  @ApiForbiddenResponse({
    description: 'Only administrators can view all vehicles.',
  })
  findAll(@Query() query: QueryVehicleDto) {
    this.logger.log('GET /vehicles - Retrieve all vehicles with filters');
    return this.vehiclesService.findAll(query);
  }

  /**
   * Retrieves all vehicles owned by a specific owner
   */
  @Get('owner/:ownerId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get vehicles by owner ID (Admin only)',
    description:
      'Retrieves all vehicles owned by a specific user. ' +
      'User must have owner role.',
  })
  @ApiParam({
    name: 'ownerId',
    type: Number,
    description: 'Owner user ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'List of vehicles owned by the user.',
  })
  @ApiNotFoundResponse({
    description: 'Owner not found.',
  })
  @ApiBadRequestResponse({
    description: 'User is not an owner.',
  })
  @ApiUnauthorizedResponse({
    description: 'Not authenticated or invalid token.',
  })
  @ApiForbiddenResponse({
    description: 'Only administrators can view owner vehicles.',
  })
  findByOwner(@Param('ownerId', ParseIntPipe) ownerId: number) {
    this.logger.log(`GET /vehicles/owner/${ownerId} - Retrieve vehicles for owner`);
    return this.vehiclesService.findByOwner(ownerId);
  }

  /**
   * Retrieves all vehicles assigned to a specific driver
   */
  @Get('driver/:driverId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get vehicles by driver ID (Admin only)',
    description:
      'Retrieves all vehicles assigned to a specific driver. ' +
      'User must have driver role.',
  })
  @ApiParam({
    name: 'driverId',
    type: Number,
    description: 'Driver user ID',
    example: 2,
  })
  @ApiResponse({
    status: 200,
    description: 'List of vehicles assigned to the driver.',
  })
  @ApiNotFoundResponse({
    description: 'Driver not found.',
  })
  @ApiBadRequestResponse({
    description: 'User is not a driver.',
  })
  @ApiUnauthorizedResponse({
    description: 'Not authenticated or invalid token.',
  })
  @ApiForbiddenResponse({
    description: 'Only administrators can view driver vehicles.',
  })
  findByDriver(@Param('driverId', ParseIntPipe) driverId: number) {
    this.logger.log(`GET /vehicles/driver/${driverId} - Retrieve vehicles for driver`);
    return this.vehiclesService.findByDriver(driverId);
  }

  /**
   * Retrieves trip history for a specific vehicle
   */
  @Get(':id/trips')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get trips for a vehicle (Admin only)',
    description: 'Retrieves complete trip history for a specific vehicle.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Vehicle ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'List of trips made by the vehicle.',
  })
  @ApiNotFoundResponse({
    description: 'Vehicle not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Not authenticated or invalid token.',
  })
  @ApiForbiddenResponse({
    description: 'Only administrators can view vehicle trips.',
  })
  getTrips(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`GET /vehicles/${id}/trips - Retrieve trips for vehicle`);
    return this.vehiclesService.getTripsByVehicle(id);
  }

  /**
   * Retrieves statistics for a specific vehicle
   * Includes total trips, total distance, and last trip information
   */
  @Get(':id/stats')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get vehicle statistics (Admin only)',
    description:
      'Calculates and returns statistics for a vehicle including: ' +
      'total number of trips, total distance traveled (in km), and last trip details.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Vehicle ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description:
      'Vehicle statistics retrieved successfully. ' +
      'Returns totalTrips, totalDistance (as formatted string), and lastTrip object.',
  })
  @ApiNotFoundResponse({
    description: 'Vehicle not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Not authenticated or invalid token.',
  })
  @ApiForbiddenResponse({
    description: 'Only administrators can view vehicle statistics.',
  })
  getStats(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`GET /vehicles/${id}/stats - Retrieve statistics for vehicle`);
    return this.vehiclesService.getVehicleStats(id);
  }

  /**
   * Retrieves a single vehicle by ID
   * Includes complete information: owner, drivers, and trips
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get vehicle by ID (Admin only)',
    description:
      'Retrieves complete information for a specific vehicle including ' +
      'owner details, assigned drivers, and trip history.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Vehicle ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle retrieved successfully with complete information.',
    type: VehicleResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Vehicle not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Not authenticated or invalid token.',
  })
  @ApiForbiddenResponse({
    description: 'Only administrators can view vehicle details.',
  })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    this.logger.log(
      `GET /vehicles/${id} - Retrieve vehicle by user ID: ${req.user.idUser}`,
    );
    return this.vehiclesService.findOne(id);
  }

  /**
   * Updates the status of a vehicle
   * Validates status against allowed enum values
   */
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update vehicle status (Admin only)',
    description:
      'Updates the operational status of a vehicle. ' +
      'Valid statuses: active, inactive, maintenance.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Vehicle ID',
    example: 1,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['active', 'inactive', 'maintenance'],
          description: 'New vehicle status',
          example: 'active',
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle status updated successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid vehicle status provided.',
  })
  @ApiNotFoundResponse({
    description: 'Vehicle not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Not authenticated or invalid token.',
  })
  @ApiForbiddenResponse({
    description: 'Only administrators can update vehicle status.',
  })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    this.logger.log(`PATCH /vehicles/${id}/status - Update status to: ${status}`);
    return this.vehiclesService.updateStatus(id, status);
  }
}