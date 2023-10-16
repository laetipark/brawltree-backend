import {
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UserProfileService } from './services/user-profile.service';
import { UserBattlesService } from './services/user-battles.service';
import { UserBrawlersService } from './services/user-brawlers.service';
import { EventsService } from '~/maps/services/events.service';
import { SeasonsService } from '~/seasons/seasons.service';

@Controller('brawlian')
export class UsersController {
  constructor(
    private eventsService: EventsService,
    private usersService: UsersService,
    private userProfileService: UserProfileService,
    private userBattlesService: UserBattlesService,
    private userBrawlersService: UserBrawlersService,
    private seasonsService: SeasonsService,
  ) {}

  @Get()
  @HttpCode(200)
  async selectUsers(@Query('keyword') keyword: string) {
    return this.usersService.findUsers(keyword);
  }

  @Get('/:id')
  @HttpCode(200)
  async selectUser(@Param('id') id: string) {
    const user = await this.usersService.findUser(id);
    if (
      !user ||
      new Date(new Date(user.updatedAt).getTime() + 2 * 60 * 1000) < new Date()
    ) {
      await this.insertUser(id, user);
    }
    const season = await this.seasonsService.findSeason();

    return {
      user: await this.usersService.findUser(id),
      profile: await this.userProfileService.findUserProfile(id, season),
    };
  }

  @Get('/:id/brawlers')
  @HttpCode(200)
  async selectUserBrawlers(@Param('id') id: string) {
    const season = await this.seasonsService.findSeason();
    const [brawlers, brawlerItems, brawlerGraphs] =
      await this.userBrawlersService.findUserBrawlers(id, season);

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
    const season = await this.seasonsService.findSeason();
    const rotationTL = await this.eventsService.findModeTL();
    const rotationPL = await this.eventsService.findModePL();
    const [battlesSummary, brawlersSummary] =
      await this.userBattlesService.findUserBattles(id, type, mode, season);
    const [recentBattles, recentBrawlers, battles] =
      await this.userBattlesService.findUserBattleLogs(id, type, mode, season);

    return {
      rotationTL: rotationTL,
      rotationPL: rotationPL,
      battlesSummary: battlesSummary,
      brawlersSummary: brawlersSummary,
      recentBattles: recentBattles,
      recentBrawlers: recentBrawlers,
      battles: battles,
      season: season,
    };
  }

  @Post('/:id')
  async insertUser(@Param('id') id: string, data) {
    const user = await this.usersService.getUser(id);

    if (!user) {
      return;
    }
    if (!data) {
      await this.usersService.createUser({
        userID: user.tag,
        lastBattleAt: new Date(0),
        crew: null,
        crewName: null,
      });
    }

    return await this.updateUser(id, user);
  }

  @Patch('/:id')
  async updateUser(@Param('id') id: string, user: any) {
    const season = await this.seasonsService.findSeason();
    await this.userProfileService.updateUserProfile(user, season);
    await this.userBattlesService.getUserBattles(id);
  }
}
