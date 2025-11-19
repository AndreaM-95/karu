import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DriverStatus, Gender, LicenseCategory, UserRole } from './entities/user.entity';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { count } from 'console';

const userFake=[
  {idFake: 1, email: 'val@mail.com',password: '1234567',role: UserRole.DRIVER, gender: 'female',name: 'Vale',phone: '3214567890'},
  {idFake: 2, email: 'and@mail.com',password: '12345622',role: UserRole.PASSENGER, gender: 'female',name: 'Andre',phone: '3245678901'},
  {idFake: 3, email: 'marce@mail.com',password: '12345694',role: UserRole.OWNER, gender: 'female',name: 'Marce',phone: '3306789012'},
  {idFake: 4, email: 'dami@mail.com',password: '12345675',role: UserRole.DRIVER, gender: 'female',name: 'Dani',phone: '3145678903'},
] 

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let fakeUserRepo;

  beforeEach(()=>{
    jest.clearAllMocks();

    fakeUserRepo={
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((newUFake) => ({idUser: 1, active: true, ...newUFake})),
      save: jest.fn((user) => user),
      update: jest.fn()
    };

    (bcrypt.hash as jest.Mock).mockResolvedValue('helodt7123');
    service = new UsersService(fakeUserRepo as any)
  });


  it('should return all users', async ()=>{
    const allFake = await service.getAllUser();
    expect(fakeUserRepo.find).toHaveBeenCalled();
  });


  it('sould return an user by id', async ()=>{
    fakeUserRepo.findOne.mockResolvedValue(userFake[0])
    const result= await service.findById(1)
    expect(result.email).toEqual('val@mail.com')
  });

  it('should return NotFoundException if the user doesnt exist', async()=>{
    fakeUserRepo.findOne.mockResolvedValue(null)
    await expect(service.findById(100)).rejects.toThrow(NotFoundException)
  });


 
})