import _ from 'lodash';

import { enemyDefinitions } from 'app/content/enemies/enemyHash';
import { AnimationEffect } from 'app/content/animationEffect';
import { EnemyArrow } from 'app/content/arrow';
import { Flame } from 'app/content/effects/flame';
import { FrostGrenade } from 'app/content/effects/frostGrenade';
import {
    beetleAnimations,
    beetleHornedAnimations,
    beetleMiniAnimations,
    beetleWingedAnimations,
    snakeAnimations,
} from 'app/content/enemyAnimations';
import { simpleLootTable, lifeLootTable, moneyLootTable } from 'app/content/lootTables';
import { addObjectToArea, getAreaSize } from 'app/content/areas';
import { FRAME_LENGTH } from 'app/gameConstants';
import { moveActor } from 'app/moveActor';
import { createAnimation } from 'app/utils/animations';
import { directionMap } from 'app/utils/field';

import {
    ActorAnimations, Clone, Direction,
    Enemy, FrameAnimation, FrameDimensions, GameState,
    Hero, HitProperties, HitResult, LootTable, MagicElement, MovementProperties, ObjectInstance,
} from 'app/types';


export const enemyTypes = <const>[
    'arrowTurret',
    'beetle', 'beetleHorned', 'beetleMini', 'beetleWinged',
    'flameSnake', 'frostBeetle',
    'lightningBug',
    'snake',
    'wallLaser',
];
// Not intended for use in the editor.
export type EnemyType = typeof enemyTypes[number];

export interface EnemyDefinition {
    alwaysReset?: boolean,
    animations: ActorAnimations,
    aggroRadius?: number,
    canBeKnockedBack?: boolean,
    canBeKnockedDown?: boolean,
    flipRight?: boolean,
    flying?: boolean,
    hasShadow?: boolean,
    life?: number,
    lootTable?: LootTable,
    immunities?: MagicElement[],
    params?: any,
    speed?: number,
    acceleration?: number,
    scale?: number,
    touchDamage: number,
    update?: (state: GameState, enemy: Enemy) => void,
    onDeath?: (state: GameState, enemy: Enemy) => void,
    onHit?: (state: GameState, enemy: Enemy, hit: HitProperties) => HitResult,
    render?: (context: CanvasRenderingContext2D, state: GameState, enemy: Enemy) => void,
    getHealthPercent?: (state: GameState, enemy: Enemy) => number,
    getShieldPercent?: (state: GameState, enemy: Enemy) => number,
}

enemyDefinitions.arrowTurret = {
    animations: beetleAnimations, life: 4, touchDamage: 1, update: spinAndShoot,
    lootTable: simpleLootTable,
    canBeKnockedBack: false,
};
enemyDefinitions.snake = {
    animations: snakeAnimations, life: 2, touchDamage: 1, update: paceRandomly, flipRight: true,
    lootTable: simpleLootTable,
};
enemyDefinitions.beetle = {
    animations: beetleAnimations, acceleration: 0.05, life: 2, touchDamage: 1, update: scurryAndChase,
    lootTable: simpleLootTable,
};
enemyDefinitions.beetleHorned = {
    animations: beetleHornedAnimations, life: 3, touchDamage: 1, update: paceAndCharge,
    lootTable: moneyLootTable,
};
enemyDefinitions.beetleMini = {
    animations: beetleMiniAnimations,
    acceleration: 0.01,
    speed: 0.8,
    hasShadow: false, life: 1, touchDamage: 1, update: scurryRandomly,
    lootTable: lifeLootTable,
};
enemyDefinitions.beetleWinged = {
    animations: beetleWingedAnimations,
    flying: true, acceleration: 0.1, aggroRadius: 112,
    life: 1, touchDamage: 1, update: scurryAndChase,
    lootTable: simpleLootTable,
};
enemyDefinitions.wallLaser = {
    animations: snakeAnimations, life: 1, touchDamage: 1, update: updateWallLaser, flipRight: true,
    lootTable: simpleLootTable, params: { alwaysShoot: false },
};
enemyDefinitions.flameSnake = {
    alwaysReset: true,
    animations: snakeAnimations, speed: 1.1,
    life: 3, touchDamage: 1, update: updateFlameSnake, flipRight: true,
    immunities: ['fire'],
};
enemyDefinitions.frostBeetle = {
    alwaysReset: true,
    animations: beetleAnimations, speed: 0.7, aggroRadius: 112,
    life: 5, touchDamage: 1, update: updateFrostBeetle,
    immunities: ['ice'],
};
enemyDefinitions.lightningBug = {
    alwaysReset: true,
    animations: beetleWingedAnimations, acceleration: 0.2, speed: 1, aggroRadius: 112, flying: true,
    life: 3, touchDamage: 1, update: updateStormLightningBug, render: renderLightningShield,
    immunities: ['lightning'],
};

function updateFlameSnake(state: GameState, enemy: Enemy): void {
    paceRandomly(state, enemy);
    if (enemy.params.flameCooldown > 0) {
        enemy.params.flameCooldown -= FRAME_LENGTH;
    } else {
        const hitbox = enemy.getHitbox(state);
        const flame = new Flame({
            x: hitbox.x + hitbox.w / 2,
            y: hitbox.y + hitbox.h / 2 - 1,
        });
        flame.x -= flame.w / 2;
        flame.y -= flame.h / 2;
        addObjectToArea(state, enemy.area, flame);
        enemy.params.flameCooldown = 400;
    }
    enemy.params.shootCooldown = enemy.params.shootCooldown ?? 1000 + Math.random() * 1000;
    if (enemy.params.shootCooldown > 0) {
        enemy.params.shootCooldown -= FRAME_LENGTH;
    } else if (enemy.modeTime >= 200) {
        const {hero} = getLineOfSightTargetAndDirection(state, enemy, enemy.d);
        if (!hero) {
            return;
        }
        enemy.params.shootCooldown = 2000;
        const hitbox = enemy.getHitbox(state);
        const [dx, dy] = directionMap[enemy.d];
        const flame = new Flame({
            x: hitbox.x + hitbox.w / 2 + dx * hitbox.w / 2,
            y: hitbox.y + hitbox.h / 2 - 1 + dy * hitbox.h / 2,
            vx: 4 * dx,
            vy: 4 * dy,
            ttl: 1000,
        });
        flame.x -= flame.w / 2;
        flame.y -= flame.h / 2;
        addObjectToArea(state, enemy.area, flame);
        enemy.params.flameCooldown = 400;
    }
}
function updateFrostBeetle(state: GameState, enemy: Enemy): void {
    if (enemy.params.shootCooldown > 0) {
        enemy.params.shootCooldown -= FRAME_LENGTH;
    } else {
        const attackVector = getVectorToNearbyTarget(state, enemy, enemy.aggroRadius / 2, enemy.area.allyTargets);
        if (attackVector) {
            throwIceGrenadeAtLocation(state, enemy, {
                tx: state.hero.x + state.hero.w / 2,
                ty: state.hero.y + state.hero.h / 2,
            });
            enemy.params.shootCooldown = 3000;
        } else {
            scurryAndChase(state, enemy);
        }
    }
}
function updateStormLightningBug(state: GameState, enemy: Enemy): void {
    enemy.params.shieldColor = 'yellow';
    scurryAndChase(state, enemy);
    enemy.params.shieldCooldown = enemy.params.shieldCooldown ?? 1000 + Math.random() * 1000;
    if (enemy.params.shieldCooldown > 0) {
        enemy.params.shieldCooldown -= FRAME_LENGTH;
        if (enemy.params.shieldCooldown < 3000) {
            enemy.shielded = false;
        }
    } else {
        const chaseVector = getVectorToNearbyTarget(state, enemy, enemy.aggroRadius, enemy.area.allyTargets);
        if (chaseVector) {
            enemy.params.shieldCooldown = 5000;
            enemy.shielded = true;
        }
    }
}

function renderLightningShield(context: CanvasRenderingContext2D, state: GameState, enemy: Enemy): void {
    const hitbox = enemy.getHitbox(state);
    context.strokeStyle = enemy.params.shieldColor ?? '#888';
    if (enemy.shielded) {
        context.save();
            context.globalAlpha *= (0.7 + 0.3 * Math.random());
            context.beginPath();
            context.arc(hitbox.x + hitbox.w / 2, hitbox.y + hitbox.h / 2, hitbox.w / 2, 0, 2 * Math.PI);
            context.stroke();
        context.restore();
    } else {
        let theta = Math.random() * Math.PI / 8;
        for (let i = 0; i < 4; i++) {
            context.beginPath();
            context.arc(hitbox.x + hitbox.w / 2, hitbox.y + hitbox.h / 2, hitbox.w / 2, theta, theta + (1 + Math.random()) * Math.PI / 8);
            theta += 2 * Math.PI / 4 + Math.random() * Math.PI / 8;
            context.stroke();
        }
    }
}
export function throwIceGrenadeAtLocation(state: GameState, enemy: Enemy, {tx, ty}: {tx: number, ty: number}, damage = 1): void {
    const hitbox = enemy.getHitbox(state);
    const x = hitbox.x + hitbox.w / 2;
    const y = hitbox.y + hitbox.h / 2;
    const z = 8;
    const vz = 4;
    const az = -0.2;
    const duration = -2 * vz / az;
    const frostGrenade = new FrostGrenade({
        damage,
        x,
        y,
        z,
        vx: (tx - x) / duration,
        vy: (ty - y) / duration,
        vz,
        az,
    });
    addObjectToArea(state, enemy.area, frostGrenade);
}

function spinAndShoot(state: GameState, enemy: Enemy): void {
    if (typeof enemy.params.currentTheta === 'undefined') {
        enemy.params.lastTheta = enemy.params.currentTheta = Math.floor(Math.random() * 2) * Math.PI / 4;
    }
    if (enemy.mode === 'shoot') {
        if (enemy.modeTime === 100) {
            for (let i = 0; i < 4; i++) {
                const hitbox = enemy.getHitbox(state);
                const dx = Math.cos(enemy.params.currentTheta + i * Math.PI / 2);
                const dy = Math.sin(enemy.params.currentTheta + i * Math.PI / 2);
                const arrow = new EnemyArrow({
                    x: hitbox.x + hitbox.w / 2 + hitbox.w / 2 * dx,
                    y: hitbox.y + hitbox.h / 2 + hitbox.h / 2 * dy,
                    vx: 4 * dx,
                    vy: 4 * dy,
                });
                addObjectToArea(state, enemy.area, arrow);
            }
        }
        if (enemy.modeTime >= 500) {
            enemy.setMode('spin');
        }
    } else {
        enemy.params.currentTheta = enemy.params.lastTheta + Math.PI / 4 * enemy.modeTime / 1000;
        if (enemy.modeTime >= 500) {
            enemy.params.lastTheta = enemy.params.currentTheta = (enemy.params.lastTheta + Math.PI / 4) % (2 * Math.PI);
            enemy.setMode('shoot');
        }
    }
}

function updateWallLaser(state: GameState, enemy: Enemy): void {
    function shoot() {
        const hitbox = enemy.getHitbox(state);
        const dx = directionMap[enemy.d][0];
        const dy = directionMap[enemy.d][1];
        const arrow = new EnemyArrow({
            x: hitbox.x + hitbox.w / 2 + hitbox.w / 2 * dx,
            y: hitbox.y + hitbox.h / 2 + hitbox.h / 2 * dy,
            vx: 4 * dx,
            vy: 4 * dy,
        });
        addObjectToArea(state, enemy.area, arrow);
    }
    if (enemy.params.alwaysShoot) {
        if (enemy.modeTime % 300 === FRAME_LENGTH) {
            shoot();
        }
        return;
    }
    if (enemy.mode === 'shoot') {
        const {hero} = getLineOfSightTargetAndDirection(state, enemy, enemy.d, true);
        if (!hero && enemy.modeTime > 900) {
            enemy.setMode('wait');
        } else if (enemy.modeTime % 300 === FRAME_LENGTH) {
            shoot();
        }
    } else if (enemy.mode === 'charge') {
        if (enemy.modeTime >= 500) {
            enemy.setMode('shoot');
        }
    } else {
        const {hero} = getLineOfSightTargetAndDirection(state, enemy, enemy.d, true);
        if (hero) {
            enemy.setMode('charge');
        }
    }
}

export function moveEnemyToTargetLocation(state: GameState, enemy: Enemy, tx: number, ty: number): number {
    const hitbox = enemy.getHitbox(state);
    const dx = tx - (hitbox.x + hitbox.w / 2), dy = ty - (hitbox.y + hitbox.h / 2);
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag > enemy.speed) {
        moveEnemy(state, enemy, enemy.speed * dx / mag, enemy.speed * dy / mag, {
            boundToSection: false,
            boundToSectionPadding: 0,
        });
        return mag - enemy.speed;
    }
    moveEnemy(state, enemy, dx, dy, {});
    return 0;
}

// The enemy choose a vector and accelerates in that direction for a bit.
// The enemy slides a bit since it doesn't immediately move in the desired direction.
const maxScurryTime = 4000;
const minScurryTime = 1000;
function scurryRandomly(state: GameState, enemy: Enemy) {
    if (enemy.mode === 'choose' && enemy.modeTime > 200) {
        enemy.params.theta = 2 * Math.PI * Math.random();
        enemy.setMode('scurry');
        enemy.currentAnimation = enemy.enemyDefinition.animations.idle[enemy.d];
    }
    let tvx = 0, tvy = 0;
    if (enemy.mode === 'scurry') {
        tvx = enemy.speed * Math.cos(enemy.params.theta);
        tvy = enemy.speed * Math.sin(enemy.params.theta);
        if (enemy.modeTime > minScurryTime &&
            Math.random() < (enemy.modeTime - minScurryTime) / (maxScurryTime - minScurryTime)
        ) {
            enemy.setMode('choose');
        }
    }
    const ax = tvx - enemy.vx;
    const ay = tvy - enemy.vy;
    accelerateInDirection(state, enemy, {x: ax, y: ay});
    moveEnemy(state, enemy, enemy.vx, enemy.vy, {});
}

export function accelerateInDirection(state: GameState, enemy: Enemy, a: {x: number, y: number}): void {
    let mag = Math.sqrt(a.x * a.x + a.y * a.y);
    if (mag) {
        enemy.vx = enemy.vx + enemy.acceleration * a.x / mag;
        enemy.vy = enemy.vy + enemy.acceleration * a.y / mag;
        mag = Math.sqrt(enemy.vx * enemy.vx + enemy.vy * enemy.vy);
        if (mag > enemy.speed) {
            enemy.vx = enemy.speed * enemy.vx / mag;
            enemy.vy = enemy.speed * enemy.vy / mag;
        }
    }
}

function scurryAndChase(state: GameState, enemy: Enemy) {
    const chaseVector = getVectorToNearbyTarget(state, enemy, enemy.aggroRadius, enemy.area.allyTargets);
    if (chaseVector) {
        accelerateInDirection(state, enemy, chaseVector);
        moveEnemy(state, enemy, enemy.vx, enemy.vy, {});
    } else {
        scurryRandomly(state, enemy);
    }
}

export function paceAndCharge(state: GameState, enemy: Enemy) {
    if (enemy.mode === 'knocked') {
        enemy.animationTime = 0;
        enemy.z += enemy.vz;
        enemy.vz -= 0.5;
        moveEnemy(state, enemy, enemy.vx, enemy.vy, {canFall: true});
        if (enemy.z < 0) {
            enemy.z = 0;
        }
    } else if (enemy.mode === 'stunned') {
        enemy.animationTime = 0;
        if (enemy.modeTime > 500) {
            enemy.setMode('choose');
            enemy.setAnimation('idle', enemy.d);
        }
    } else if (enemy.mode !== 'charge') {
        const {d, hero} = getLineOfSightTargetAndDirection(state, enemy);
        if (hero) {
            enemy.d = d;
            enemy.setMode('charge');
            enemy.canBeKnockedBack = false;
            enemy.setAnimation('attack', enemy.d);
        } else {
            paceRandomly(state, enemy);
        }
    } else if (enemy.mode === 'charge') {
        if (enemy.modeTime < 400) {
            enemy.animationTime = 0;
            return;
        }
        if (!moveEnemy(state, enemy, 3 * enemy.speed * directionMap[enemy.d][0], 3 * enemy.speed * directionMap[enemy.d][1], {canFall: true})) {
            enemy.setMode('stunned');
            enemy.canBeKnockedBack = true;
            enemy.knockBack(state, {
                vx: -enemy.speed * directionMap[enemy.d][0],
                vy: -enemy.speed * directionMap[enemy.d][1],
                vz: 4,
            });
        }
    }
}

export function getVectorToNearbyTarget(state: GameState, enemy: Enemy, radius: number, targets: ObjectInstance[]): {x: number, y: number} {
    const hitbox = enemy.getHitbox(state);
    for (const target of targets) {
        if (!target || target.area !== enemy.area || !target.getHitbox) {
            continue;
        }
        const targetHitbox = target.getHitbox(state);
        const dx = (targetHitbox.x + targetHitbox.w / 2) - (hitbox.x + hitbox.w / 2);
        const dy = (targetHitbox.y + targetHitbox.h / 2) - (hitbox.y + hitbox.h / 2);
        const mag = Math.sqrt(dx * dx + dy * dy);
        if (mag <= radius) {
            return {x: dx / mag, y: dy / mag};
        }
    }
    return null;
}

function getLineOfSightTargetAndDirection(state: GameState, enemy: Enemy, direction: Direction = null, projectile: boolean = false): {d: Direction, hero: Hero} {
    const hitbox = enemy.getHitbox(state);
    for (const hero of [state.hero, state.hero.astralProjection, ...state.hero.clones]) {
        if (!hero || hero.area !== enemy.area) {
            continue;
        }
        // Reduce dimensions of hitbox for these checks so that the hero is not in line of sight when they are most of a tile
        // off (like 0.5px in line of sight), otherwise the hero can't hide from line of sight on another tile if
        // they aren't perfectly lined up with the tile.
        if (hitbox.x + 1 < hero.x + hero.w && hitbox.x + hitbox.w - 1 > hero.x && (direction !== 'left' && direction !== 'right')) {
            if ((hero.y < hitbox.y && direction === 'down') || (hero.y > hitbox.y && direction === 'up')) {
                continue
            }
            const x = Math.floor(hitbox.x / 16);
            const y1 = Math.floor(hero.y / 16), y2 = Math.floor(hitbox.y / 16);
            const minY = Math.min(y1, y2);
            const maxY = Math.max(y1, y2);
            let blocked = false;
            for (let y = minY; y <= maxY; y++) {
                const tileBehavior = {...(enemy.area?.behaviorGrid[y]?.[x] || {})};
                if (tileBehavior.solid || (!projectile && (tileBehavior.pit || tileBehavior.water))) {
                    blocked = true;
                    break;
                }
            }
            if (!blocked) {
                return {
                    d: hero.y < hitbox.y ? 'up' : 'down',
                    hero,
                };
            }
        }
        if (hitbox.y + 1 < hero.y + hero.h && hitbox.y + hitbox.h - 1 > hero.y && (direction !== 'up' && direction !== 'down')) {
            if ((hero.x < hitbox.x && direction === 'right') || (hero.x > hitbox.x && direction === 'left')) {
                continue
            }
            const y = Math.floor(hitbox.y / 16);
            const x1 = Math.floor(hero.x / 16), x2 = Math.floor(hitbox.x / 16);
            const minX = Math.min(x1, x2);
            const maxX = Math.max(x1, x2);
            let blocked = false;
            for (let x = minX; x <= maxX; x++) {
                const tileBehavior = {...(enemy.area?.behaviorGrid[y]?.[x] || {})};
                if (tileBehavior.solid || (!projectile && (tileBehavior.pit || tileBehavior.water))) {
                    blocked = true;
                    break;
                }
            }
            if (!blocked) {
                return {
                    d: hero.x < hitbox.x ? 'left' : 'right',
                    hero,
                };
            }
        }
    }
    return {d: null, hero: null};
}

// The enemy pauses to choose a random direction, then moves in that direction for a bit and repeats.
// If the enemy encounters an obstacle, it will change directions more quickly.
function paceRandomly(state: GameState, enemy: Enemy) {
    if (enemy.mode === 'choose' && enemy.modeTime > 200) {
        enemy.setMode('walk');
        enemy.d = _.sample(['up', 'down', 'left', 'right']);
        enemy.currentAnimation = enemy.enemyDefinition.animations.idle[enemy.d];
    }
    if (enemy.mode === 'walk') {
        if (enemy.modeTime >= 200) {
            if (!moveEnemy(state, enemy, enemy.speed * directionMap[enemy.d][0], enemy.speed * directionMap[enemy.d][1], {})) {
                enemy.setMode('choose');
                enemy.modeTime = 200;
            }
        }
        if (enemy.modeTime > 700 && Math.random() < (enemy.modeTime - 700) / 3000) {
            enemy.setMode('choose');
        }
    }
}

export function moveEnemy(state: GameState, enemy: Enemy, dx: number, dy: number, movementProperties: MovementProperties): boolean {
    if (!movementProperties.excludedObjects) {
        movementProperties.excludedObjects = new Set();
    }
    movementProperties.excludedObjects.add(state.hero);
    movementProperties.excludedObjects.add(state.hero.astralProjection);
    movementProperties.boundToSectionPadding = movementProperties.boundToSectionPadding ?? 16;
    movementProperties.boundToSection = movementProperties.boundToSection ?? true;
    for (const clone of enemy.area.objects.filter(object => object instanceof Clone)) {
        movementProperties.excludedObjects.add(clone);
    }
    if (enemy.flying) {
        const hitbox = enemy.getHitbox(state);
        const ax = enemy.x + dx;
        const ay = enemy.y + dy;
        if (movementProperties.boundToSection) {
            const p = movementProperties.boundToSectionPadding ?? 0;
            const { section } = getAreaSize(state);
            if (ax < section.x + p || ax + hitbox.w > section.x + section.w - p
                || ay < section.y + p || ay + hitbox.h > section.y + section.h - p
            ) {
                return false;
            }
        }
        enemy.x = ax;
        enemy.y = ay;
        return true;
    }
    const { mx, my } = moveActor(state, enemy, dx, dy, movementProperties);
    return mx !== 0 || my !== 0;
}

const fallGeometry: FrameDimensions = {w: 24, h: 24};
export const enemyFallAnimation: FrameAnimation = createAnimation('gfx/effects/enemyfall.png', fallGeometry, { cols: 10, duration: 4}, { loop: false });


export function checkForFloorEffects(state: GameState, enemy: Enemy) {
    const behaviorGrid = enemy.area.behaviorGrid;
    const tileSize = 16;

    const hitbox = enemy.getHitbox(state);
    let leftColumn = Math.floor((hitbox.x + 6) / tileSize);
    let rightColumn = Math.floor((hitbox.x + hitbox.w - 7) / tileSize);
    let topRow = Math.floor((hitbox.y + 6) / tileSize);
    let bottomRow = Math.floor((hitbox.y + hitbox.h - 7) / tileSize);

    for (let row = topRow; row <= bottomRow; row++) {
        for (let column = leftColumn; column <= rightColumn; column++) {
            const behaviors = behaviorGrid?.[row]?.[column];
            // This will happen when the player moves off the edge of the screen.
            if (!behaviors) {
                //startSwimming = false;
                continue;
            }
            /*if (behaviors.climbable) {
                startClimbing = true;
            }
            if (!behaviors.water) {
                startSwimming = false;
            }*/
            if (behaviors.pit && enemy.z <= 0 && !enemy.flying) {
                const pitAnimation = new AnimationEffect({
                    animation: enemyFallAnimation,
                    x: column * 16 - 4, y: row * 16 - 4,
                });
                addObjectToArea(state, enemy.area, pitAnimation);
                enemy.status = 'gone';
                return;
            }
        }
    }
}