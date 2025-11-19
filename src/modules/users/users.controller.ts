import { Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from './entities/user.entity';
import { createUserDTO } from './dto/createUser.dto';
import { updateUserAdminDTO } from './dto/updateUserAdmin.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { updateUserSelfDTO } from './dto/updateUserSelf.dto';
import { updateDriverStatusDTO } from './dto/updateDriverStatus.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('/api/users')
export class UsersController {
    private readonly logger = new Logger(UsersController.name);
    constructor(private readonly userService: UsersService){}

    @Get()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'List of all users returned' })
    getAllUser(){
        this.logger.debug('Admin requested all users')
        return this.userService.getAllUser();
    }

    @Get(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get one user by ID' })
    @ApiResponse({ status: 200, description: 'User found' })
    @ApiResponse({ status: 404, description: 'User not found' })
    getById(@Param('id', ParseIntPipe) id: number){
        this.logger.debug(`Admin requested user with ID: ${id}`)
        return this.userService.findById(id);
    }

    @Get('rol/:rol')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get users filtered by role (admin only)',
    description: 'Valid roles: admin, owner, driver, passenger'})
    findByRol(@Param('rol') rol: UserRole){
        this.logger.debug(`Admin requested users with role: ${rol}`);
        return this.userService.findByRol(rol);
    }

    @Get('name/:name')
    @Roles(UserRole.ADMIN, UserRole.OWNER)
    @ApiOperation({ summary: 'Find users by name' })
    findByNameOwner(@Param('name') name:string){
        this.logger.debug(`Owner requested search by name: ${name}`)
        return this.userService.findByNameOwner(name);
    }

    @Post()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a new user (admin only)' })
    @ApiResponse({ status: 201, description: 'User created successfully' })
    @ApiResponse({ status: 409, description: 'Email already registered' })
    createUser(@Body() body: createUserDTO){
        this.logger.debug(`Admin is creating a new user: ${body.email}`);
        return this.userService.createUser(body);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update any user (admin only)' })
    @ApiResponse({ status: 200, description: 'User updated successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 409, description: 'Email already in use' })
    @ApiResponse({ status: 400, description: 'Invalid role or gender' })
    updateUserByAdmin(@Param('id', ParseIntPipe) id: number,@Body() dto: updateUserAdminDTO) {
        this.logger.debug(`Admin updating user ID: ${id}`)
        return this.userService.updateUserByAdmin(id, dto);
    }

    @Patch('passenger/me')
    @Roles(UserRole.PASSENGER)
    @ApiOperation({ summary: 'Passenger updates their own profile' })
    @ApiResponse({ status: 200, description: 'Profile updated successfully' })
    @ApiResponse({ status: 403, description: 'Only passengers can use this endpoint' })
    @ApiResponse({ status: 409, description: 'Email or phone already in use' })
    updateOnlyPassenger(@Req() req, @Body() dto: updateUserSelfDTO) {
        this.logger.debug(`Passenger ${req.user.idUser} updating profile`)
        return this.userService.updateOnlyPassenger(req.user.idUser, dto);
    }

    @Patch('driverStatus/:Driverid')
    @Roles(UserRole.ADMIN, UserRole.DRIVER)
    @ApiOperation({ summary: 'Update driver availability status' })
    @ApiResponse({ status: 200, description: 'Driver status updated' })
    @ApiResponse({ status: 404, description: 'Driver not found' })
    @ApiResponse({ status: 400, description: 'User is not a driver or is inactive' })
    @ApiResponse({ status: 403, description: 'Drivers can only change their own status' })
    updateDriverStatus(@Param('Driverid', ParseIntPipe) Driverid: number,@Body() dto: updateDriverStatusDTO,@Req() req) {
        this.logger.debug(`User ${req.user.idUser} updating driver status for driver ${Driverid}`,)
        return this.userService.updateDriverStatus(Driverid, dto, req.user.idUser, req.user.role);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Deactivate a user' })
    @ApiResponse({ status: 200, description: 'User deactivated successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 400, description: 'User is already inactive' })
    desactivateUser(@Param('id', ParseIntPipe) id: number){
        this.logger.warn(`Admin deactivating user ID: ${id}`)
        return this.userService.desactivateUser(id);
    }
}