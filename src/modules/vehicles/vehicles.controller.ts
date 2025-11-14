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
}