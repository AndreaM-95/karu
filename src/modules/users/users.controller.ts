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
}