import { Controller, Get, Param } from '@nestjs/common';

import { CrewService } from './crew.service';

@Controller('crew')
export class CrewController {
  constructor(private crewService: CrewService) {}

  @Get('/members')
  async selectMembersTable() {
    return await this.crewService.selectMemberTable();
  }

  @Get('/members/:id')
  async selectMember(@Param('id') id: string) {
    // const isPatch = await this.crewService.updateCrewMember(id);
    //
    // if (!isPatch) {
    //   throw new NotFoundException(
    //     `${FailureResponseEnum.USER_NOT_FOUND}: ${id}`,
    //   );
    // }

    return {
      friends: await this.crewService.selectMemberFriends(id),
      seasonRecords: await this.crewService.selectMemberSeason(id)
    };
  }
}
