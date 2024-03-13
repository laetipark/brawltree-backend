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
  'pumpkinPlunder',
];
const soloModes = {
  battle: ['duel'],
  survive: [
    'soloShowdown',
    'takedown',
    'holdTheTrophy',
    'loneStar',
    'hunters',
    'trophyEscape',
  ],
};
const duoModes = ['duoShowdown'];

export default () => ({
  axios: {
    baseURL: process.env.CRAWLER_HOST,
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
