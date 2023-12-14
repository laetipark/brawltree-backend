import { Controller, Get, Param, Query } from '@nestjs/common';

import { CrewService } from './crew.service';

@Controller('blossom')
export class CrewController {
  constructor(private crewService: CrewService) {}

  @Get('/main')
  async selectMain() {
    const [brawlersTL, brawlersPL] =
      await this.crewService.selectBrawlerSummary();
    const rotation = await this.crewService.getDailyRotation();

    return {
      members: await this.crewService.selectMembersSummary(),
      battles: await this.crewService.selectBattlesSummary(),
      season: await this.crewService.selectSeasonSummary(),
      events: rotation,
      brawlersTL: brawlersTL,
      brawlersPL: brawlersPL,
    };
  }

  @Get('/members')
  async selectMembersTable() {
    return await this.crewService.selectMemberTable();
  }

  @Get('/brawlers')
  async selectBrawlersTable(@Query('brawler') brawler: string) {
    return await this.crewService.findBrawlerTable(brawler);
  }

  @Get('/battles')
  async selectBattlesTable(
    @Query('date') date: Date,
    @Query('type') type: string,
    @Query('mode') mode: string,
  ) {
    const nextDate = new Date(new Date(date).getTime() + 1000 * 60 * 60 * 24);
    const { rotationTL, rotationPL } = this.crewService.getModes();
    const season = await this.crewService.getSeason();

    return {
      rotationTL: await rotationTL,
      rotationPL: await rotationPL,
      members: await this.crewService.selectBattlesTable(
        date,
        nextDate,
        type,
        mode,
      ),
      season: season,
    };
  }

  @Get('/season')
  async selectSeasonTable(
    @Query('type') type: string,
    @Query('mode') mode: string,
  ) {
    const { rotationTL, rotationPL } = this.crewService.getModes();

    return {
      rotationTL: await rotationTL,
      rotationPL: await rotationPL,
      members: await this.crewService.selectSeasonTable(type, mode),
    };
  }

  @Get('/members/:id')
  async selectMember(@Param('id') id: string) {
    return {
      friends: await this.crewService.selectMemberFriends(id),
      seasonRecords: await this.crewService.selectMemberSeasonRecords(id),
    };
  }
}
