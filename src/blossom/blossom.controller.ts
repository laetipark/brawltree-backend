import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlossomService } from './blossom.service';
import { SeasonsService } from '../seasons/seasons.service';
import { RotationService } from '../maps/services/rotation.service';

@Controller('blossom')
export class BlossomController {
  constructor(
    private blossomService: BlossomService,
    private rotationService: RotationService,
    private seasonService: SeasonsService,
  ) {}

  @Get('/main/members')
  async selectMembersSummary() {
    return await this.blossomService.findMemberSummary();
  }

  @Get('/main/battles')
  async selectBattlesSummary() {
    return await this.blossomService.findBattlesSummary();
  }

  @Get('/main/season')
  async selectSeasonSummary() {
    return await this.blossomService.findSeasonSummary();
  }

  @Get('/main/rotation')
  async selectRotationSummary() {
    return await this.rotationService.findRotationTL();
  }

  @Get('/main/brawlers')
  async selectBrawlersSummary() {
    return await this.blossomService.findBrawlerSummary();
  }

  @Get('/members/table')
  async selectMembersTable() {
    return await this.blossomService.findMemberTable();
  }

  @Get('/brawlers/table')
  async selectBrawlersTable(@Query('brawler') brawler: string) {
    return await this.blossomService.findBrawlerTable(brawler);
  }

  @Get('/battles/table')
  async selectBattlesTable(
    @Query('date') date: Date,
    @Query('type') type: string,
    @Query('mode') mode: string,
  ) {
    const nextDate = new Date(new Date(date).getTime() + 1000 * 60 * 60 * 24);

    return {
      gameModesTL: await this.rotationService.findModeTL(),
      gameModesPL: await this.rotationService.findModePL(),
      members: await this.blossomService.findBattlesTable(
        date,
        nextDate,
        type,
        mode,
      ),
      season: await this.seasonService.findSeason(),
    };
  }

  @Get('/season/table')
  async selectSeasonTable(
    @Query('type') type: string,
    @Query('mode') mode: string,
  ) {
    return {
      gameModesTL: await this.rotationService.findModeTL(),
      gameModesPL: await this.rotationService.findModePL(),
      members: await this.blossomService.findSeasonTable(type, mode),
      season: await this.seasonService.findSeason(),
    };
  }

  @Get('/member/:id/battles')
  async selectMemberBattles(
    @Param('id') id: string,
    @Query('date') date: Date,
  ) {
    const nextDate = new Date(new Date(date).getTime() + 1000 * 60 * 60 * 24);

    return {
      battles: await this.blossomService.findMemberBattles(id, date, nextDate),
      season: await this.seasonService.findSeason(),
    };
  }

  @Get('/member/:id/friends')
  async selectMemberFriends(@Param('id') id: string) {
    return await this.blossomService.findMemberFriends(id);
  }

  @Get('/member/:id/season')
  async selectMemberSeasonRecords(@Param('id') id: string) {
    return await this.blossomService.findMemberSeasonRecords(id);
  }

  @Get('/battles/:id')
  async selectMemberBattleLogs(
    @Param('id') id: string,
    @Query('date') date: Date,
  ) {
    const nextDate = new Date(new Date(date).getTime() + 1000 * 60 * 60 * 24);

    return {
      battles: await this.blossomService.findMemberBattleLogs(
        id,
        date,
        nextDate,
      ),
      season: await this.seasonService.findSeason(),
    };
  }
}
