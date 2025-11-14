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

//REGISTER VEHICLE

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

  //LIST VEHICLES WITH FILTERS AND PAGINATION
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
  
}