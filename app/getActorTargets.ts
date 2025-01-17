import { Hero } from 'app/content/hero';
import { isPointInShortRect } from 'app/utils/index';

import { Actor, GameState, ObjectInstance, TileCoords } from 'app/types';

export function getActorTargets(state: GameState, actor: Actor): {tiles: TileCoords[], objects: ObjectInstance[]} {
    const tileSize = 16;
    const objects: ObjectInstance[] = []
    const tiles: TileCoords[] = []

    const checkPoints: {x: number, y: number}[] = [];
    if (actor.d === 'left') {
        checkPoints.push({x: actor.x - 2, y: actor.y});
        checkPoints.push({x: actor.x - 2, y: actor.y + actor.h - 1});
    }
    if (actor.d === 'right') {
        checkPoints.push({x: actor.x + actor.w + 1, y: actor.y});
        checkPoints.push({x: actor.x + actor.w + 1, y: actor.y + actor.h - 1});
    }
    if (actor.d === 'up') {
        checkPoints.push({x: actor.x, y: actor.y - 2});
        checkPoints.push({x: actor.x + actor.w - 1, y: actor.y - 2});
    }
    if (actor.d === 'down') {
        checkPoints.push({x: actor.x, y: actor.y + actor.h + 1});
        checkPoints.push({x: actor.x + actor.w - 1, y: actor.y + actor.h + 1});
    }

    for (const object of actor.area.objects.filter(o => o.getHitbox)) {
        if (object.status === 'gone' || object.status === 'hidden' || object.status === 'hiddenEnemy' || object.status === 'hiddenSwitch') {
            continue;
        }
        // thrown clones are not interactive or solid.
        if (object instanceof Hero && object.action === 'thrown') {
            continue;
        }
        const hitbox = object.getHitbox(state);
        for (const point of checkPoints) {
            if (isPointInShortRect(point.x, point.y, hitbox)) {
                objects.push(object);
            }
        }
    }

    if (actor.d === 'left' || actor.d === 'right') {
        const column = Math.floor((actor.d === 'left' ? (actor.x - 2) : (actor.x + actor.w + 2)) / tileSize);
        const top = Math.floor(actor.y / tileSize);
        const bottom = Math.floor((actor.y + actor.h - 1) / tileSize);
        tiles.push({x: column, y: top});
        if (top !== bottom) {
            tiles.push({x: column, y: bottom});
        }
    } else if (actor.d === 'up' || actor.d === 'down') {
        const row = Math.floor((actor.d === 'up' ? (actor.y - 2) : (actor.y + actor.h + 2)) / tileSize);
        const left = Math.floor((actor.x) / tileSize);
        const right = Math.floor((actor.x + actor.w - 1) / tileSize);
        tiles.push({x: left, y: row});
        if (left !== right) {
            tiles.push({x: right, y: row});
        }
    }

    return { objects, tiles };
}
