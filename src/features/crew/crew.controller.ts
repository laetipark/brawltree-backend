import { Controller, Get, Param, Query } from '@nestjs/common';

import { CrewService } from './crew.service';

@Controller('blossom')
export class CrewController {
  constructor(private crewService: CrewService) {}

  @Get('/main')
  async selectMain() {
    const [brawlersTL, brawlersPL] =
      await this.crewService.findBrawlerSummary();
    const rotation = await this.crewService.getDailyRotation();

    return {
      members: await this.crewService.findMembersSummary(),
      battles: await this.crewService.findBattlesSummary(),
      season: await this.crewService.findSeasonSummary(),
      events: rotation,
      brawlersTL: brawlersTL,
      brawlersPL: brawlersPL,
    };
  }

  @Get('/members')
  async selectMembersTable() {
    return await this.crewService.findMemberTable();
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
      members: await this.crewService.findBattlesTable(
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
      members: await this.crewService.findSeasonTable(type, mode),
    };
  }

  @Get('/members/:id')
  async selectMember(@Param('id') id: string) {
    return {
      friends: await this.crewService.findMemberFriends(id),
      seasonRecords: await this.crewService.findMemberSeasonRecords(id),
    };
  }
}
