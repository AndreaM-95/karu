import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDTO } from './dto/create-vehicle.dto';
import { UpdateVehicleDTO } from './dto/update-vehicle.dto';
import { QueryVehicleDTO } from './dto/query-vehicle.dto';
import { VehicleStatus } from './entities/vehicle.entity';

@ApiTags('Vehicles')
@Controller('vehicles')
@UseInterceptors(ClassSerializerInterceptor)
// @UseGuards(JwtAuthGuard) // Descomentar si usas autenticación
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

/**
   * Create a new vehicle.
   * Calls the service to create a vehicle with validations:
   * - Unique license plate
   * - Owner exists
   * - Vehicle associated with owner
   * Returns the created vehicle.
   */
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo vehículo' })
  @ApiResponse({
    status: 201,
    description: 'Vehículo creado exitosamente',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un vehículo con esa placa',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o propietario no existe',
  })

  async create(@Body() createVehicleDto: CreateVehicleDTO) {
    return await this.vehiclesService.create(createVehicleDto);
  }

  /**
   * List all vehicles with optional filters and pagination.
   * Filters supported: vehicleType, statusVehicle, ownerId.
   * Pagination supported: page, limit.
   * Returns paginated vehicles data.
   */
   @Get()
  @ApiOperation({ summary: 'Obtener todos los vehículos con filtros' })
  @ApiResponse({
    status: 200,
    description: 'Lista de vehículos obtenida exitosamente',
  })
  @ApiQuery({ name: 'vehicleType', required: false })
  @ApiQuery({ name: 'statusVehicle', required: false })
  @ApiQuery({ name: 'ownerId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() queryDto: QueryVehicleDTO) {
    return await this.vehiclesService.findAll(queryDto);
  }

  /**
   * Retrieve all available vehicles.
   * Calls the service to get vehicles with ACTIVE status.
   */
  @Get('available')
  @ApiOperation({ summary: 'Obtener vehículos disponibles' })
  @ApiResponse({
    status: 200,
    description: 'Lista de vehículos disponibles',
  })
  async getAvailable() {
    return await this.vehiclesService.getAvailableVehicles();
  }

  /**
   * Retrieve vehicles by owner ID.
   * Returns all vehicles associated with a specific owner.
   */
  @Get('owner/:ownerId')
  @ApiOperation({ summary: 'Get vehicles by owner' })
  @ApiResponse({ status: 200, description: 'List of owner vehicles' })
  async findByOwner(@Param('ownerId', ParseIntPipe) ownerId: number) {
    return await this.vehiclesService.findByOwner(ownerId);
  }

  /**
   * Find a vehicle by its license plate.
   * Returns the vehicle if found, 404 otherwise.
   */
  @Get('plate/:plate')
  @ApiOperation({ summary: 'Find vehicle by plate' })
  @ApiResponse({ status: 200, description: 'Vehicle found' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async findByPlate(@Param('plate') plate: string) {
    return await this.vehiclesService.findByPlate(plate);
  }

  /**
   * Get full vehicle details by ID.
   * Includes vehicle info, owner info, and trip history.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  @ApiResponse({ status: 200, description: 'Vehicle found' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.vehiclesService.findOne(id);
  }

  /**
   * Update a vehicle by ID.
   * Updates any vehicle field provided in the DTO.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a vehicle' })
  @ApiResponse({ status: 200, description: 'Vehicle updated successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVehicleDto: UpdateVehicleDTO,
  ) {
    return await this.vehiclesService.update(id, updateVehicleDto);
  }

  /**
   * Update only the status of a vehicle.
   * Accepts status values: ACTIVE, INACTIVE, MAINTENANCE.
   */
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update vehicle status' })
  @ApiResponse({ status: 200, description: 'Vehicle status updated successfully' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: VehicleStatus,
  ) {
    return await this.vehiclesService.updateStatus(id, status);
  }

  /**
   * Permanently delete a vehicle by ID.
   * Returns no content on success.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a vehicle' })
  @ApiResponse({ status: 204, description: 'Vehicle deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.vehiclesService.remove(id);
  }

  /**
   * Soft delete (deactivate) a vehicle.
   * Marks the vehicle as inactive without removing it from the database.
   */
  @Delete(':id/soft')
  @ApiOperation({ summary: 'Deactivate a vehicle (soft delete)' })
  @ApiResponse({ status: 200, description: 'Vehicle deactivated successfully' })
  async softDelete(@Param('id', ParseIntPipe) id: number) {
    return await this.vehiclesService.softDelete(id);
  }
}