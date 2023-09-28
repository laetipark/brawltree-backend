import { Repository } from 'typeorm';
import { Body, Injectable, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateUsersDto } from '../dto/create-users.dto';

import { Users } from '../entities/users.entity';
import { HttpService } from '@nestjs/axios';

import { catchError, firstValueFrom, map, of } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private users: Repository<Users>,
    private readonly httpService: HttpService,
  ) {}

  async createUser(@Body() userData: CreateUsersDto): Promise<Users> {
    const user = this.users.create(userData);
    return await this.users.save(user);
  }

  async findUser(@Param('id') id: string) {
    return await this.users
      .createQueryBuilder('u')
      .select('u.USER_ID', 'USER_ID')
      .addSelect('u.USER_LST_CK', 'USER_LST_CK')
      .addSelect('u.USER_LST_BT', 'USER_LST_BT')
      .addSelect('u.USER_CR', 'USER_CR')
      .addSelect('u.USER_CR_NM', 'USER_CR_NM')
      .addSelect('up.USER_NM', 'USER_NM')
      .addSelect('up.USER_PRFL', 'USER_PRFL')
      .innerJoin('u.userProfile', 'up')
      .where(`u.USER_ID = :id`, {
        id: `#${id}`,
      })
      .getRawOne();
  }

  async getUser(@Param('id') id: string) {
    return firstValueFrom(
      this.httpService.get(`players/%23${id}`).pipe(
        map((res) => {
          return res.data;
        }),
        catchError((e) => {
          return of(e);
        }),
      ),
    );
  }
}
