import { Controller, Post, Req, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RequestWithUser } from '../modules/auth/model/request-with-user';
import { Auth } from '../modules/auth/auth.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() request: RequestWithUser, 
    @Body('username') username: string,
  ) {
    const uid = request.user.uid;
    console.log(`Creating user with UID: ${uid}, username: ${username}`);
    await this.usersService.createUser(uid, username);
  }

}
