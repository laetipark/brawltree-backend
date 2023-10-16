import { Injectable } from '@nestjs/common';

@Injectable()
export class BattleService {
  setMatchGrade(type: string, grade: string[]) {
    if (type === '0') {
      return grade;
    } else {
      const array = [];
      grade?.map((num) => {
        array.push(parseInt(num) * 3 + 1);
        if (num !== '6') {
          array.push(parseInt(num) * 3 + 2);
          array.push(parseInt(num) * 3 + 3);
        }
      });

      return array;
    }
  }
}
