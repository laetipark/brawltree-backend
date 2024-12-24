import { Injectable } from '@nestjs/common';
import { SeasonDto } from '~/seasons/dto/season.dto';

@Injectable()
export class SeasonsService {
  constructor() {}

  convertSeasonTime(date: Date) {
    const seasonTime = new Date(date);

    seasonTime.setDate(1 + ((11 - date.getDay() + 7) % 7));
    seasonTime.setHours(18, 0, 0, 0);

    return seasonTime;
  }

  /** 현재 시즌 정보 반환 */
  getRecentSeason(): SeasonDto {
    const date = new Date();

    // 주어진 날짜에 해당하는 월의 첫째날을 찾음
    let prevSeasonMonth = new Date(date.getFullYear(), date.getMonth(), 1, 18);
    // 해당 달의 첫째주 목요일을 찾음
    let prevSeasonTime = this.convertSeasonTime(prevSeasonMonth);

    // 현재 날짜가 해당 달의 첫째주 목요일 이전인 경우
    if (date.getDate() < prevSeasonTime.getDate()) {
      // 이전 달의 첫째주 목요일 찾기
      prevSeasonMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
      prevSeasonTime = this.convertSeasonTime(prevSeasonMonth);
    }

    // 다음 달을 찾음
    const currSeasonMonth = new Date(
      prevSeasonMonth.getFullYear(),
      prevSeasonMonth.getMonth() + 1,
      1,
      18,
    );
    // 다음 달의 첫째주 목요일을 찾음
    const currSeasonTime = this.convertSeasonTime(currSeasonMonth);

    return {
      beginDate: prevSeasonTime,
      endDate: currSeasonTime,
    };
  }
}
