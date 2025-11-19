import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DriverStatus, Gender, user, UserRole } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { createUserDTO } from './dto/createUser.dto';
import { updateUserAdminDTO } from './dto/updateUserAdmin.dto';
import * as bcrypt from 'bcrypt';
import { updateUserSelfDTO } from './dto/updateUserSelf.dto';
import { updateDriverStatusDTO } from './dto/updateDriverStatus.dto';
import { Like, Repository } from 'typeorm';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);
    constructor(@InjectRepository(user) private readonly userRepo: Repository<user>){}
/*
UH-01: See all users
* return all users
*/
    getAllUser(){
        this.logger.debug('Fetching all users')
        return this.userRepo.find();
    }
/*
UH-02: See an user by id
* return an user by id
*/
    async findById(id: number) {
        this.logger.debug(`Looking for user with ID: ${id}`)
        const findUser = await this.userRepo.findOne({ where: { idUser: id }});

    if (!findUser) {
        this.logger.warn(`User with ID ${id} not found`)
        throw new NotFoundException(`User with ID ${id} not found`)
    }
    this.logger.log(`User with ID ${id} found`)
    return findUser;
    }


}
