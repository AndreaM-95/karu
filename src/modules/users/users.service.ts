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
/*
Validate rol and gender by user
* admin, driver and passenger only can be gender=>female
* owner can be=> female, male, other
*/
    private valideRolGender(role:UserRole, gender: Gender){
        this.logger.debug(`Validating gender ${gender} for role ${role}`)
        switch(role){
            case UserRole.ADMIN:
            case UserRole.DRIVER:
            case UserRole.PASSENGER:
                if(gender !== 'female'){
                    this.logger.warn(`Invalid gender ${gender} for role ${role}`)
                    throw new BadRequestException(`A user with rol ${role} must be female`);
                }
                break;
            case UserRole.OWNER:
                if (!['female', 'male', 'other'].includes(gender)) {
                    this.logger.warn(`Invalid gender ${gender} for role owner`)
                    throw new BadRequestException('A owner must be: female, male, other');
            }
            break;
            default: this.logger.warn(`Invalid role provided: ${role}`)
            throw new BadRequestException("Rol must be: admin, owner, driver or passenger")   
        }
        this.logger.debug('Gender validation passed')
    }
/*
UH-05: Create an user
* the users name cant be under 18 years old
*validate the email is not already registered
* if the user is a driver, request the required fields
* encrypt the password
*/
    async createUser(newUser: createUserDTO) {
        this.logger.debug(`Creating user with email: ${newUser.email}`)
        
        const birthDate = new Date(newUser.dateOfBirth)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()

        const difference = today.getMonth() - birthDate.getMonth()

        if (difference < 0 || (difference === 0 && today.getDate() < birthDate.getDate())) age--
        if (age < 18){
            this.logger.warn(`User ${newUser.email} is under 18`)
            throw new BadRequestException("User must be at least 18 years old")
        }

        const existingEmail = await this.userRepo.findOne({where: { email: newUser.email }})
        if (existingEmail){
            this.logger.warn(`Email already registered: ${newUser.email}`)
            throw new ConflictException(`Email ${newUser.email} is already registered`)
        }
        if (newUser.role === UserRole.DRIVER) {
            if (!newUser.driverLicense || !newUser.licenseCategory || !newUser.licenseExpirationDate){
                this.logger.warn(`Driver ${newUser.email} missing license info`)
                throw new BadRequestException('Drivers must provide: driverLicense, licenseCategory, and licenseExpirationDate')
             }
    const existingLicense = await this.userRepo.findOne({where: { driverLicense: newUser.driverLicense}})
    if (existingLicense){
        this.logger.warn(`Driver license already registered: ${newUser.driverLicense}`)
        throw new ConflictException(`Driver license ${newUser.driverLicense} is already registered`)
    }

    const expirationDate = new Date(newUser.licenseExpirationDate)
    const present = new Date()
    present.setHours(0, 0, 0, 0)
    
    if (expirationDate <= present){
        this.logger.warn(`Driver license expired: ${newUser.licenseExpirationDate}`)
        throw new BadRequestException('License expiration date must be in the future')
    }
}

  this.valideRolGender(newUser.role, newUser.gender);

  const hashedPassword = await bcrypt.hash(newUser.password, 10);

  const userInfo: Partial<user> = {
    name: newUser.name,
    gender: newUser.gender,
    email: newUser.email,
    phone: newUser.phone,
    dateOfBirth: newUser.dateOfBirth ? new Date(newUser.dateOfBirth) : null,
    password: hashedPassword,
    role: newUser.role,
    active: true
  }

  if (newUser.role === UserRole.DRIVER) {
    userInfo.driverStatus = DriverStatus.AVAILABLE
    userInfo.driverLicense = newUser.driverLicense
    userInfo.licenseCategory = newUser.licenseCategory
    userInfo.licenseExpirationDate = new Date(newUser.licenseExpirationDate as string)
  } else {
    userInfo.driverStatus = null
    userInfo.driverLicense = null
    userInfo.licenseCategory = null
    userInfo.licenseExpirationDate = null
  }

  const userToCreate = this.userRepo.create(userInfo);
  const savedUser = await this.userRepo.save(userToCreate);

  this.logger.log(`User ${savedUser.email} created successfully`)
  const { password, ...user } = savedUser

const userWithoutPassword: Record<string, any> = { ...user }
  if (savedUser.role !== UserRole.DRIVER) {
    delete userWithoutPassword.driverStatus
    delete userWithoutPassword.driverLicense
    delete userWithoutPassword.licenseCategory
    delete userWithoutPassword.licenseExpirationDate
  }

  return {message: "User has been created successfully",user: userWithoutPassword}
}

/*
UH-06: update an user
* * the administrator can update all users, owner, driver, cannot
* encrypt the password
* validate rol, gender
*/
    async updateUserByAdmin(id: number, dto: updateUserAdminDTO) {
        this.logger.debug(`Admin updating user with ID: ${id}`)
        const userUpdate = await this.userRepo.findOne({ where: { idUser: id } });

    if (!userUpdate) {
        this.logger.warn(`User with ID ${id} not found`)
        throw new NotFoundException(`User with ID ${id} not found`);
    }

    const roleToValidate = dto.role ?? userUpdate.role;

    const genderToValidate = dto.gender ?? userUpdate.gender;

    this.valideRolGender(roleToValidate, genderToValidate)
    this.logger.debug(`Role and gender validated for user ID: ${id}`)

    if (dto.email && dto.email !== userUpdate.email) {
        const existEmail = await this.userRepo.findOne({ where: { email: dto.email }})
        if (existEmail) {
            this.logger.warn(`Email ${dto.email} already in use`)
            throw new ConflictException(`Email ${dto.email} is already in use`)
        }
    }

    if (dto.password) {
        dto.password = await bcrypt.hash(dto.password, 10);
    }

    let driverStatusUpdate: DriverStatus | null = userUpdate.driverStatus
    const newRole = dto.role || userUpdate.role;

    if (dto.role) {
        if (newRole === UserRole.DRIVER) {
            driverStatusUpdate = DriverStatus.AVAILABLE;
        }else {
            driverStatusUpdate = null;
        }
    }
    
    await this.userRepo.update(id, { ...dto, driverStatus: driverStatusUpdate})

        const updatedUser = await this.userRepo.findOne({ where: { idUser: id }})
        this.logger.log(`User with ID ${id} updated successfully`)
        
        return{message: `User ${id} updated successfully`,user: updatedUser as user}

    }


}
