import { Injectable } from '@nestjs/common';
import { SeasonDto } from '~/seasons/dto/season.dto';

@Injectable()
export class SeasonsService {
  constructor() {}

  /** 현재 시즌 정보 반환 */
  async getRecentSeason(): Promise<SeasonDto> {
    const date = new Date();
    // 주어진 날짜에 해당하는 월의 첫째날을 찾음
    const thisMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    // 해당 달의 첫째주 목요일을 찾음
    const beginDate = new Date(thisMonth);
    beginDate.setDate(1 + ((11 - thisMonth.getDay() + 7) % 7));

    // 현재 날짜가 해당 달의 첫째주 목요일 이전인 경우
    if (date.getTime() < beginDate.getTime()) {
      // 이전 달의 첫째주 목요일 찾기
      thisMonth.setMonth(thisMonth.getMonth() - 1);
      thisMonth.setDate(1);
      beginDate.setTime(thisMonth.getTime());
      beginDate.setDate(1 + ((11 - thisMonth.getDay() + 7) % 7));
    }

    // 다음 달을 찾음
    const nextMonth = new Date(
      thisMonth.getFullYear(),
      thisMonth.getMonth() + 1,
      1,
    );
    // 다음 달의 첫째주 목요일을 찾음
    const endDate = new Date(nextMonth);
    endDate.setDate(1 + ((11 - nextMonth.getDay() + 7) % 7));

    return {
      beginDate,
      endDate,
    };
  }
}
