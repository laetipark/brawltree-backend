import { Injectable } from '@nestjs/common';

@Injectable()
export class URLService {
  transformString = (input) => {
    // 특수문자를 제거하고 띄어쓰기를 '-'로 변환
    let transformed = input
      .replace(/[^\w\s가-힣a-zA-Z]/g, '')
      .replace(/\s+/g, '-');

    // 마지막에 '-'가 있으면 제거
    if (transformed.endsWith('-')) {
      transformed = transformed.slice(0, -1);
    }
    return transformed.toLowerCase();
  };
}
