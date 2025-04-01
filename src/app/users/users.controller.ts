import { Controller, Post, Req, Body, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { RequestWithUser } from '../modules/auth/model/request-with-user';
import { Auth } from '../modules/auth/auth.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

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

  @Get('/me')
  @Auth()
  async getMe(@Req() request: RequestWithUser) {
    const uid = request.user.uid;
    const email = request.user.email;
    console.log(`Fetching user with UID: ${uid}`);

    const user = await this.usersService.getUser(uid);
    return {
      uid,
      username: user.username,
      email,
    };
  }

}
