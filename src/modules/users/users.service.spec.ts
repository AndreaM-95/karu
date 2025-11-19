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

  it('should create a PASSENGER user successfully', async () => {
    const newUFake = {
      name: 'Maria',
      gender: Gender.FEMALE,
      email: 'mary@mail.com',
      phone: '3214567890',
      dateOfBirth: '2000-01-01',
      password: '123456',
    role: UserRole.PASSENGER
  };

    fakeUserRepo.findOne.mockResolvedValueOnce(null); // email no existe

    fakeUserRepo.create.mockReturnValue({...newUFake, idUser: 1, active: true});
    
    fakeUserRepo.save.mockResolvedValue({...newUFake, idUser: 1, active: true});
    const result = await service.createUser(newUFake);
    
    expect(fakeUserRepo.findOne).toHaveBeenCalledWith({ where: { email: newUFake.email } });
    expect(bcrypt.hash).toHaveBeenCalled();
    expect(fakeUserRepo.create).toHaveBeenCalled();
    expect(fakeUserRepo.save).toHaveBeenCalled();
    expect(result).toEqual({message: "User has been created successfully",
      user: expect.objectContaining({
        idUser: 1,
        name: newUFake .name,
        gender: newUFake .gender,
        email: newUFake .email,
        phone: newUFake .phone,
        role: newUFake .role,
        active: true,
        dateOfBirth: newUFake.dateOfBirth})});
  });


it('should throw error if user is under 18', async () => {
  const todayFake = new Date();
  todayFake.setFullYear(todayFake.getFullYear() - 17);

  const newUFake = {
    name: 'carlita',
    gender: Gender.FEMALE,
    email: 'carl@mail.com',
    phone: '3214567890',
    dateOfBirth: todayFake.toISOString(), 
    password: '123456',
    role: UserRole.PASSENGER,
  }

  await expect(service.createUser(newUFake)).rejects.toThrow('User must be at least 18 years old');
});


it('should throw conflict if email already exists', async () => {
  const newUFake = {
    name: 'danielita',
    gender: Gender.FEMALE,
    email: 'dami@mail.com',
    phone: '3214567890',
    dateOfBirth: '2000-01-01',
    password: '123456',
    role: UserRole.PASSENGER,
  };
  fakeUserRepo.findOne.mockResolvedValueOnce({ idUser: 50 });
  
  await expect(service.createUser(newUFake)).rejects.toThrow(ConflictException);
});


it('should create a DRIVER user successfully', async () => {
  const newUFake = {
    name: 'consuelo',
    gender: Gender.FEMALE,
    email: 'consu@mail.com',
    phone: '3214567890',
    dateOfBirth: '1995-01-01',
    password: '123456',
    role: UserRole.DRIVER,
    driverLicense: 12345,
    licenseCategory: LicenseCategory.B1,
    licenseExpirationDate: '2030-01-01',
  };

  fakeUserRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null); //email y licencia no existe, entonces ok

  const result = await service.createUser(newUFake);

  expect(result.user.driverStatus).toBe(DriverStatus.AVAILABLE);
  expect(result.user.driverLicense).toBe(newUFake.driverLicense);
});


it('should throw error if driver license is expired', async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const newUFake = {
    name: 'Driver Test',
    gender: Gender.FEMALE,
    email: 'driver@mail.com',
    phone: '3214567890',
    dateOfBirth: '1995-01-01',
    password: '123456',
    role: UserRole.DRIVER,
    driverLicense: 12345,
    licenseCategory: LicenseCategory.B1,
    licenseExpirationDate: yesterday.toISOString(),
  };
  
  fakeUserRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null)// email y licencia no existen
  await expect(service.createUser(newUFake))
    .rejects.toThrow('License expiration date must be in the future'); 
});


it('should throw conflict if driver license already exists', async () => {
  const newUFake = {
    name: 'andreeeee',
    gender: Gender.FEMALE,
    email: 'andriiii@mail.com',
    phone: '3214567890',
    dateOfBirth: '1995-01-01',
    password: '123456',
    role: UserRole.DRIVER,
    driverLicense: 12345,
    licenseCategory: LicenseCategory.B1,
    licenseExpirationDate: '2030-01-01',
  };

  fakeUserRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ idUser: 99 }); // licencia duplicada, email ok

  await expect(service.createUser(newUFake)).rejects.toThrow(ConflictException);
});

it('should update a user successfully', async () => {
  fakeUserRepo.findOne
  .mockResolvedValueOnce({idFake: 10, email: 'valii@mail.com',password: '1234568',role: UserRole.DRIVER, gender: 'female',name: 'Valery',phone: '3214567899'}).mockResolvedValueOnce(null)
  .mockResolvedValueOnce({idUser: 10,email: 'new@mail.com',phone: '3001112233'});
  
  const change = {phone: '3001112233',email: 'new@mail.com'}
  const result = await service.updateUserByAdmin(10, change);

  expect(result).toEqual({message: `User 10 updated successfully`,
    user: expect.objectContaining({idUser: 10,email: 'new@mail.com',phone: '3001112233'})});
});


it('should throw NotFoundException if user does not exist', async () => {
  fakeUserRepo.findOne.mockResolvedValueOnce(null);
  await expect(service.updateUserByAdmin(1000, {})).rejects.toThrow(`User with ID 1000 not found`);

});


it('should throw ConflictException if new email already exists', async () => {
  fakeUserRepo.findOne.mockResolvedValueOnce({ idUser: 20, role: UserRole.PASSENGER, gender: Gender.FEMALE, email: "old@mail.com"}).mockResolvedValueOnce({ idUser: 99 }); 

  const email = { email: 'useeeee@mail.com' };

  await expect(service.updateUserByAdmin(20, email)).rejects.toThrow(ConflictException);
});
 
})