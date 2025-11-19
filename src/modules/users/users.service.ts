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
/*
UH-03: See all user by rol
* return users by rol
*/
    async findByRol(role: UserRole){
        this.logger.debug(`Fetching users with role: ${role}`)
        if (!Object.values(UserRole).includes(role)) {
            this.logger.warn(`Invalid role provided: ${role}`)
            throw new BadRequestException(`Invalid role: ${role}`);
        }
    const users = await this.userRepo.find({where: {role}})
    this.logger.log(`${users.length} users found with role ${role}`)
        return {count:users.length,users}
    }
/*
UH-04: See an user by name
* return user by name
*/
    async findByNameOwner(name: string){
        this.logger.debug(`Searching for drivers with name like: ${name}`)
        const findName = await this.userRepo.find({where:{
            name:Like(`%${name}%`),
            role: UserRole.DRIVER,
            active: true}})

        if(findName.length === 0) {
            this.logger.warn(`No active drivers found with name: ${name}`)
            throw new NotFoundException('Name not found')
        }
        this.logger.log(`${findName.length} active drivers found with name matching: ${name}`)
        return findName;
    }
    

}
