import { EXPLOSION_RADIUS, FRAME_LENGTH } from 'app/gameConstants';
import { removeEffectFromArea } from 'app/utils/effects';
import { hitTargets } from 'app/utils/field';

import { AreaInstance, GameState, EffectInstance, ObjectInstance } from 'app/types';


interface Props {
    x?: number
    y?: number,
}

const duration = 500;

export class CloneExplosionEffect implements EffectInstance {
    area: AreaInstance;
    animationTime: number;
    destroyedObjects: boolean = false;
    isEffect = <const>true;
    x: number;
    y: number;
    isPlayerAttack = true;
    hitTargets: Set<EffectInstance | ObjectInstance>;
    constructor({x = 0, y = 0 }: Props) {
        this.animationTime = 0;
        this.x = x;
        this.y = y;
        this.hitTargets = new Set();
    }
    update(state: GameState) {
        this.animationTime += FRAME_LENGTH;
        const r = EXPLOSION_RADIUS * Math.max(0.25, Math.min(1, 2 * this.animationTime / duration));
        const hitResult = hitTargets(state, this.area, {
            damage: 4,
            canPush: true,
            cutsGround: true,
            destroysObjects: true,
            knockAwayFromHit: true,
            hitCircle: {x: this.x, y: this.y, r},
            hitEnemies: true,
            hitObjects: true,
            hitTiles: true,
            ignoreTargets: this.hitTargets,
        });
        if (hitResult.hitTargets.size) {
            this.hitTargets = new Set([...this.hitTargets, ...hitResult.hitTargets]);
        }
        if (this.animationTime > duration) {
            removeEffectFromArea(state, this);
        }
    }
    render(context, state: GameState) {
        const r = EXPLOSION_RADIUS * Math.max(0.25, Math.min(1, 2 * this.animationTime / duration));
        context.beginPath();
        context.arc(this.x, this.y, r, 0, 2 * Math.PI);
        context.fillStyle = 'red';
        context.fill();
    }
}

