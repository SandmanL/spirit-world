import _ from 'lodash';
import { createCanvasAndContext } from 'app/dom';
import { createAnimation, drawFrame } from 'app/utils/animations';

import { Frame, GameState } from 'app/types';


const [
    topCap, bottomCap,
    // These are drawn on the top/bottom 5px of the bar itself.
    topBar, bottomBar,
    barBack,
    // These are all small image that create the fill for the spirit bar.
    // This is the very bottom of the fill and always drawn unless spirit is < 1.
    spiritBottom,
    // This is stretched to fill the bulk of the spirit bar.
    spiritFill,
    // This is drawn at the top of the filled portion as an indicator for the current amount.
    spiritLine,
    // This is only drawn when the spirit bar is at 100%
    spiritTop
] =
    createAnimation('gfx/hud/magicbar.png', {w: 16, h: 16}, {cols: 9}).frames;

// This frame needs to have the exact height+y set on it so that it stretches verically correctly.
spiritFill.y = 13;
spiritFill.h = 1;

const [spiritBarFrameCanvas, spiritBarFrameContext] = createCanvasAndContext(16, 100 + 32);
const spiritFrame: Frame = {
    image: spiritBarFrameCanvas,
    x: 0, y: 0,
    w: spiritBarFrameCanvas.width, h: spiritBarFrameCanvas.height,
};
let lastFrameHeight: number;
function updateSpiritBarFrame(state: GameState): void {
    if (lastFrameHeight === state.hero.maxMagic) {
        return;
    }
    const context = spiritBarFrameContext;
    lastFrameHeight = state.hero.maxMagic;
    context.clearRect(0, 0, spiritFrame.w, spiritFrame.h);
    drawFrame(context, barBack, {...barBack, x: 0, y: topCap.h, h: lastFrameHeight});
    drawFrame(context, topCap, {...topCap, x: 0, y: 0});
    drawFrame(context, topBar, {...topBar, x: 0, y: topCap.h});
    drawFrame(context, bottomCap, {...bottomCap, x: 0, y: topCap.h + lastFrameHeight});
    drawFrame(context, bottomBar, {...bottomBar, x: 0, y: topCap.h + lastFrameHeight - bottomBar.h});
}

export function renderSpiritBar(context: CanvasRenderingContext2D, state: GameState): void {
    context.fillStyle = 'black';
    updateSpiritBarFrame(state);
    const x = 5, y = 5;
    drawFrame(context, spiritFrame, {...spiritFrame, x, y});
    const barHeight = state.hero.maxMagic;
    if (state.hero.magic > 0) {
        drawFrame(context, spiritBottom, {...spiritBottom, x, y: y + topCap.h + barHeight - spiritBottom.h + 1});
    }
    const fillHeight = Math.floor(state.hero.magic);
    if (fillHeight > 0) {
        drawFrame(context, spiritFill, {...spiritFill, x, y: y + topCap.h + barHeight - fillHeight, h: fillHeight});
        // Draw the top of the spirit bar at 100%, otherwise draw the indicator line at the top of the fill.
        if (fillHeight >= state.hero.maxMagic) {
            drawFrame(context, spiritTop, {...spiritTop, x, y: y + topCap.h - 1});
        } else {
            drawFrame(context, spiritLine, {...spiritLine, x, y: y + topCap.h + barHeight - fillHeight});
        }
    }
    /*let manaColor = '#AAA';
    if (state.hero.element === 'fire') {
        manaColor = '#F00';
    } else if (state.hero.element === 'ice') {
        manaColor = '#AAF';
    } else if (state.hero.element === 'lightning') {
        manaColor = '#FF8';
    }*/
}

export function updateHeroMagicStats(state: GameState) {
    state.hero.maxMagic = 20;
    state.hero.magicRegen = 4;
    if (state.hero.passiveTools.charge >= 1) {
        state.hero.maxMagic += 10;
        state.hero.magicRegen += 1;
    }
    if (state.hero.passiveTools.charge >= 2) {
        state.hero.maxMagic += 20;
        state.hero.magicRegen += 2;
    }
    if (state.hero.elements.fire) {
        state.hero.maxMagic += 10;
        state.hero.magicRegen += 1;
    }
    if (state.hero.elements.ice) {
        state.hero.maxMagic += 10;
        state.hero.magicRegen += 1;
    }
    if (state.hero.elements.lightning) {
        state.hero.maxMagic += 10;
        state.hero.magicRegen += 1;
    }
    if (state.hero.passiveTools.phoenixCrown) {
        state.hero.maxMagic += 20;
        state.hero.magicRegen += 5;
    }
}

