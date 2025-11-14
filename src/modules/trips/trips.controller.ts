import { Controller, Get, Param, Request } from '@nestjs/common';
import { TripsService } from './trips.service';

@Controller('/api/trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get('locations')
  findAllLocations() {
    return this.tripsService.findAllLocations();
  }

  @Get('locations/:locality')
  findAllNeighborhoods(@Param('locality') locality: string) {
    return this.tripsService.findAllZones(locality);
  }

  @Get('my-trips')
  async getUserTripHistory(@Request() req) {
    return this.tripsService.getUserTripHistory(req.user.idUser);
  }
}
