// Make sure enemyHash is included before any boss files which depend on it.
export * from 'app/content/enemies/enemyHash';
export * from 'app/content/bosses/beetleBoss';
export * from 'app/content/bosses/idols';
export * from 'app/content/bosses/frostSerpent';

export const bossTypes = <const>[
    'beetleBoss',
    'stormIdol', 'flameIdol', 'frostIdol',
    'frostHeart', 'frostSerpent',
];
export type BossType = typeof bossTypes[number];

const minionTypes = <const>['beetleBossWingedMinionDefinition'];

export type MinionType = typeof minionTypes[number];