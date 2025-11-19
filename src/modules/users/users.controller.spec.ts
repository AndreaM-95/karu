import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { DriverStatus, UserRole } from './entities/user.entity';

const userFake=[
  {idFake: 1, email: 'val@mail.com',password: '1234567',role: UserRole.DRIVER, gender: 'female',name: 'Vale',phone: '3214567890'},
  {idFake: 2, email: 'and@mail.com',password: '12345622',role: UserRole.PASSENGER, gender: 'female',name: 'Andre',phone: '3245678901'},
  {idFake: 3, email: 'marce@mail.com',password: '12345694',role: UserRole.OWNER, gender: 'female',name: 'Marce',phone: '3306789012'},
  {idFake: 4, email: 'dami@mail.com',password: '12345675',role: UserRole.DRIVER, gender: 'female',name: 'Dani',phone: '3145678903'},
] 
describe('UsersController', () => {
  let controller: UsersController;
  let service;

  beforeEach(async () => {
      service={
        getAllUser:jest.fn(),
        findById:jest.fn(),
        updateUserByAdmin:jest.fn(),
        updateDriverStatus:jest.fn(),
        desactivateUser:jest.fn()
    } as any;

    controller = new UsersController(service)
  });
  
  it('Must return all users', async () => {
    service.getAllUser.mockResolvedValue(userFake);
    const users = await controller.getAllUser();
    expect(users.length).toBeGreaterThan(0);
    expect(users).toEqual(userFake);
    })

  it('Must return user by id ', async () => {
    const id = 1;
    const fakeUser = userFake[0];
    service.findById.mockResolvedValue(fakeUser);
    const result = await controller.getById(id);
    expect(service.findById).toHaveBeenCalledWith(id);
    expect(result).toEqual(fakeUser);
  });

  it('Must update a user', async()=>{
    const id = 2;
    const change = { name: 'juanita', phone: '3001112233' };
    const updatedUser = { ...userFake[1], ...change };
    service.updateUserByAdmin.mockResolvedValue(updatedUser);
    const result = await controller.updateUserByAdmin(id, change);
    expect(service.updateUserByAdmin).toHaveBeenCalledWith(id, change);
    expect(result).toEqual(updatedUser);
  })

});
