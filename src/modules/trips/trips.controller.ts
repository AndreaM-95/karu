import { Controller, Get } from '@nestjs/common';
import { TripsService } from './trips.service';

@Controller('/api/trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get('locations')
  findAllLocations() {
    return this.tripsService.findAllLocations();
  }
}
