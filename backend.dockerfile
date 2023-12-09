# 베이스가 될 이미지. 로컬에 받아놓은 이미지를 먼저 찾고 없으면 리모트서버에서 받아온다.
FROM node:18.18.2

# 정보 입력
LABEL maintainer="creator98@naver.com"

# 워킹디렉토리 설정
COPY . /app
WORKDIR /app
# npm 모듈 설치
RUN npm install -g typescript ts-node @nestjs/cli
RUN npm install
RUN npm run build

# 빌드 컨텍스트에 사용할 환경변수 설정
ENV NODE_ENV=production
# 컨테이너가 실행되었을 때 실행할 명령어
CMD ["npm", "run", "start:prod"]