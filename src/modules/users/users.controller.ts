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
    
}