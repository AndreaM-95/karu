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

  it('shoul return user filtereb by rol', async()=>{
    const role = UserRole.PASSENGER
    const fakeUsers = [
    { idUser: 1, role: UserRole.PASSENGER },
    { idUser: 2, role: UserRole.PASSENGER }
  ];
    fakeUserRepo.find.mockResolvedValue(fakeUsers);
    const result= await service.findByRol(role);
    expect(fakeUserRepo.find).toHaveBeenCalledWith({ where: { role } });
    expect(result.count).toBe(fakeUsers.length);
    expect(result.users).toEqual(fakeUsers);
  });

  it('should throw BadRequestException for invalid role', async () => {
    const invalidRole = 'helowwww' as any;
    await expect(service.findByRol(invalidRole as UserRole)).rejects.toThrow(BadRequestException);
  });

    it('should return drivers that match the name (partial match)', async () => {
    const name = 'Da';
    const filt = userFake.filter(user => user.role === UserRole.DRIVER && user.name.includes('Da'));
    fakeUserRepo.find.mockResolvedValue(filt);
    const result = await service.findByNameOwner(name);
    expect(fakeUserRepo.find).toHaveBeenCalledWith({
      where: {
        name: expect.any(Object), // Like('%Da%')
        role: UserRole.DRIVER,
        active: true}});
    expect(result).toEqual(filt);
  });

  it('should throw NotFoundException if no driver matches the name', async () => {
    fakeUserRepo.find.mockResolvedValue([]);
    await expect(service.findByNameOwner('hnignh')).rejects.toThrow(NotFoundException);
  });

  it('should return all active drivers matching exact name', async () => {
    const name = 'Vale';
    const filt = userFake.filter(user => user.role === UserRole.DRIVER && user.name === 'Vale');
    fakeUserRepo.find.mockResolvedValue(filt);
    const result = await service.findByNameOwner(name);
    expect(result.length).toBe(filt.length);
    expect(result[0].name).toBe('Vale');
  });
  
 
})