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
  'wipeout5V5',
  'knockout5V5',
  'gemGrab5V5',
  'brawlBall5V5',
  'godzillaCitySmash',
  'paintBrawl',
  'jellyfishing',
  'zombiePlunder'
];
const soloModes = {
  battle: ['duels'],
  survive: [
    'soloShowdown',
    'takedown',
    'holdTheTrophy',
    'loneStar',
    'hunters',
    'trophyEscape'
  ]
};
const duoModes = ['duoShowdown', 'trioShowdown'];

export default () => ({
  axios: {
    baseURL: process.env.CRAWLER_HOST,
    apiURL: 'https://api.brawltree.me',
    cdnURL: 'https://cdn.brawltree.me',
    newsURL: 'https://brawlstars.inbox.supercell.com'
  },
  game: {
    modeClass: {
      tripleModes: tripleModes,
      soloModes: soloModes,
      duoModes: duoModes
    },
    typeList: [0, 2, 3, 4, 5, 6],
    modeList: [
      ...tripleModes,
      ...soloModes.battle,
      ...soloModes.survive,
      ...duoModes
    ]
  }
});
