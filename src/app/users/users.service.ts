import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {

  constructor(private readonly usersRepository: UsersRepository) {

  }

  async createUser(uid: string, username: string): Promise<void> {
    /*const user = this.usersRepository.getUser(uid);
    if (!!user) {
      throw new Error("User already exists");
    }*/
    return this.usersRepository.createUser(uid, username);
  }

  async getUser(uid: string): Promise<any> {
    return this.usersRepository.getUser(uid);
  }

} 