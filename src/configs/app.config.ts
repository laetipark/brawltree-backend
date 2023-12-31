const tripleModes = [
  'gemGrab',
  'brawlBall',
  'bounty',
  'heist',
  'hotZone',
  'knockout',
  'basketBrawl',
  'volleyBrawl',
  'wipeout',
  'payload',
  'siege',
  'presentPlunder',
  'holdTheTrophy',
  'botDrop',
  'snowtelThieves',
];
const soloModes = {
  battle: ['duel'],
  survive: ['soloShowdown', 'takedown', 'loneStar', 'hunters'],
};
const duoModes = ['duoShowdown'];

export default () => ({
  axios: {
    baseURL: process.env.NODE_ENV === 'development' ? `http://${process.env.CRAWLER_HOST}:${process.env.CRAWLER_PORT}` : process.env.CRAWLER_HOST,
  },
  game: {
    modeClass: {
      tripleModes: tripleModes,
      soloModes: soloModes,
      duoModes: duoModes,
    },
    typeList: [0, 2, 3, 4, 5, 6],
    modeList: [
      ...tripleModes,
      ...soloModes.battle,
      ...soloModes.survive,
      ...duoModes,
    ],
  },
});
