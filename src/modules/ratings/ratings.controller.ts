import { Body, Controller, Get, Logger, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { createRatingDTO } from './dto/createRating.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Ratings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('/api/ratings')
export class RatingsController {
  private readonly logger = new Logger(RatingsController.name);
    constructor(private readonly RatingService: RatingsService){}

  @Get('admin')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all ratings (admin only)' })
  @ApiResponse({ status: 200, description: 'List of all ratings' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only drivers and passengers' })
  adminGetAllRatings() {
    this.logger.debug('Admin requested all ratings');
    return this.RatingService.adminGetAllRatings();
  }

  @Get('admin/:id')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Get a rating by its ID (admin/owner)' })
  @ApiResponse({ status: 200, description: 'Rating found' })
  @ApiResponse({ status: 404, description: 'Rating not found' })
  adminGetRatingById(@Param('id', ParseIntPipe) id: number) {
    this.logger.debug(`Admin/Owner requested rating with ID: ${id}`);
    return this.RatingService.adminGetRatingById(id);
  }

  @Get('myratings')
  @Roles(UserRole.DRIVER, UserRole.PASSENGER)
  @ApiOperation({ summary: 'Get my received ratings (driver/passenger)' })
  @ApiResponse({status: 200,description: 'Ratings received by the user, including average score'})
  getMyRatings(@Req() req) {
    this.logger.debug(`User ${req.user.idUser} requested their ratings`);
    return this.RatingService.getMyRatings(req.user);
  }

  @Post()
  @Roles(UserRole.DRIVER, UserRole.PASSENGER)
  @ApiOperation({ summary: 'Create a rating for a completed trip' })
  @ApiResponse({ status: 201, description: 'Rating successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request: trip not eligible, already rated, or rating window expired'})
  @ApiResponse({ status: 404, description: 'Trip not found' })
  @ApiResponse({ status: 403, description: 'Forbidden: Not a participant of this trip' })
  createRating(@Body() dto: createRatingDTO, @Req() req) {
    this.logger.log(`User ${req.user.idUser} is rating a trip`);
    return this.RatingService.createRating(dto, req.user);
  }

}
