import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UserProfileService } from './services/user-profile.service';
import { UserBattlesService } from './services/user-battles.service';
import { UserBrawlersService } from './services/user-brawlers.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller('brawlian')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private userProfileService: UserProfileService,
    private userBattlesService: UserBattlesService,
    private userBrawlersService: UserBrawlersService,
    private readonly httpService: HttpService,
  ) {}

  @Get()
  @HttpCode(200)
  async selectUsers(@Query('keyword') keyword: string) {
    return this.usersService.selectUsers(keyword);
  }

  @Get('/:id')
  @HttpCode(200)
  async selectUser(@Param('id') id: string) {
    const user = await this.usersService.selectUser(id);
    const response = {
      insert: false,
      update: false,
    };

    if (!user) {
      const res = await firstValueFrom(this.httpService.post(`brawlian/${id}`));
      if (res.status === 201) {
        response.insert = true;
      }
    }

    if (
      response.insert ||
      (user &&
        new Date(new Date(user.updatedAt).getTime() + 2 * 60 * 1000) <
          new Date())
    ) {
      const res = await firstValueFrom(
        this.httpService.patch(`brawlian/${id}`),
      );
      if (res.status === 200) {
        response.update = true;
      }
    }
    if (!user && !response.insert && !response.update) {
      throw new NotFoundException(`User ${id} not Found`);
    } else {
      return {
        user: await this.usersService.selectUser(id),
        profile: await this.userProfileService.selectUserProfile(id),
      };
    }
  }

  @Get('/:id/brawlers')
  @HttpCode(200)
  async selectUserBrawlers(@Param('id') id: string) {
    const { brawlers, brawlerItems, brawlerGraphs } =
      await this.userBrawlersService.findUserBrawlers(id);

    return {
      brawlers: brawlers,
      brawlerItems: brawlerItems,
      brawlerGraphs: brawlerGraphs,
    };
  }

  @Get('/:id/battles')
  @HttpCode(200)
  async selectUserBattles(
    @Param('id') id: string,
    @Query('type') type: string,
    @Query('mode') mode: string,
  ) {
    const { season, rotationTL, rotationPL } =
      await this.userBattlesService.getRotation();
    const [battlesSummary, brawlersSummary] =
      await this.userBattlesService.findUserBattles(id, type, mode, season);
    const [recentBattles, recentBrawlers, battles] =
      await this.userBattlesService.findUserBattleLogs(id, type, mode, season);

    return {
      battlesSummary: battlesSummary,
      brawlersSummary: brawlersSummary,
      recentBattles: recentBattles,
      recentBrawlers: recentBrawlers,
      battles: battles,
      rotationTL: rotationTL,
      rotationPL: rotationPL,
      season: season,
    };
  }
}
