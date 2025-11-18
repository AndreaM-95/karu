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

  @Get('locations/:nameLocality')
  @ApiOperation({ summary: 'Locality with its zones or neighborhoods' })
  @ApiResponse({ status: 200, description: 'Object of a locality with its zones or neighborhoods' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  findAllNeighborhoods(@Param('locality') locality: string) {
    this.logger.debug(`Neighborhoods found for the locality: ${locality}`);
    return this.tripsService.findAllNeighborhoods(locality);
  }
}
