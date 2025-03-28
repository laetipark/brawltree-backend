import { Controller, Get, Param, Query } from '@nestjs/common';
import { MapsService } from '../services/maps.service';

@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  /** 로테이션 맵 목록 조회 */
  @Get('/')
  async selectMaps() {
    return {
      maps: await this.mapsService.selectMaps()
    };
  }

  /** 맵 ID에 대한 상세 정보 및 전투 통계 조회
   * @param name 맵 ID
   * @param type 전투 타입
   * @param grade 전투 등급 */
  @Get('/:name')
  async selectMap(
    @Param('name') name: string,
    @Query('type') type: string,
    @Query('grade') grade: string[]
  ) {
    const map = await this.mapsService.selectMap(name);
    if (!map.isTrophyLeague && map.isPowerLeague) {
      type = '2';
    }

    return {
      map: map,
      stats: await this.mapsService.selectMapStats(name, type, grade)
    };
  }

  /** 맵 이름에 대한 상세 정보 및 전투 통계 조회
   * @param name 맵 이름
   * @param type 타입 번호
   * @param mode 모드 이름
   * @param grade 전투 등급 */
  @Get('/name/detail')
  async selectMapSummary(
    @Query('name') name: string,
    @Query('type') type: string,
    @Query('grade') grade: string[],
    @Query('mode') mode?: string
  ) {
    const map = await this.mapsService.selectMapByName(name, mode);

    return {
      map: map,
      stats: await this.mapsService.selectMapStats(map.mapID, type, grade, 5)
    };
  }
}
