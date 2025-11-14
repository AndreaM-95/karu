import { Injectable } from '@nestjs/common';
import { User } from './entities/User.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { createUserDTO } from './dto/createUser.dto';

@Injectable()
export class UsersService {

    constructor(@InjectRepository(User) private userRepo){}

    createUser(newUser: createUserDTO){
        const userCreated = this.userRepo.create(newUser)
        return this.userRepo.save(userCreated), {message: "User has been created successfull"}
    }
}
