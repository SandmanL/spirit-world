import { getLootHelpMessage, getLootName } from 'app/content/loot';
import { isRandomizer } from 'app/gameConstants';

import { ActiveTool, Equipment, GameState, MagicElement, MenuOptionType } from 'app/types';


export function getMenuRows(state: GameState): MenuOptionType[][] {
    const menuRows: MenuOptionType[][] = [];
    const activeTools: MenuOptionType[] = ['help'];
    if (isRandomizer) {
        activeTools.push('return');
    }
    // Active tools
    if (state.hero.activeTools.bow) {
        activeTools.push('bow');
    }
    if (state.hero.activeTools.staff) {
        activeTools.push('staff');
    }
    if (state.hero.activeTools.cloak) {
        activeTools.push('cloak');
    }
    if (state.hero.activeTools.clone) {
        activeTools.push('clone');
    }
    menuRows.push(activeTools);

    const equipment: MenuOptionType[] = ['leatherBoots'];
    if (state.hero.equipment.ironBoots) {
        equipment.push('ironBoots');
    }
    if (state.hero.equipment.cloudBoots) {
        equipment.push('cloudBoots');
    }
    menuRows.push(equipment);

    const elements: MenuOptionType[] = [];
    if (state.hero.elements.fire || state.hero.elements.ice || state.hero.elements.lightning) {
        elements.push('neutral');
    }
    if (state.hero.elements.fire) {
        elements.push('fire');
    }
    if (state.hero.elements.ice) {
        elements.push('ice');
    }
    if (state.hero.elements.lightning) {
        elements.push('lightning');
    }
    menuRows.push(elements);

    let passiveToolRow: MenuOptionType[] = [];
    for (let key in state.hero.passiveTools) {
        if (!state.hero.passiveTools[key]) continue;
        // Don't show cat eyes once true sight is obtained.
        if (key === 'catEyes' && state.hero.passiveTools.trueSight) continue;
        passiveToolRow.push(key as MenuOptionType);
        if (passiveToolRow.length >= 7) {
            menuRows.push(passiveToolRow);
            passiveToolRow = [];
        }
    }
    if (passiveToolRow.length) {
        menuRows.push(passiveToolRow);
    }

    return menuRows;
}

export function getMenuName(state: GameState, type: MenuOptionType): string {
    if (type === 'help') {
        return 'Hint';
    }
    if (type === 'return') {
        return 'Return Home';
    }
    return getLootName(state, type);
}

export function getMenuHelpMessage(state: GameState, type: MenuOptionType): string {
    if (type === 'help') {
        return 'Hint';
    }
    if (type === 'return') {
        return 'Return Home';
    }
    return getLootHelpMessage(state, type);
}

// Function to set the left tool on all copies of the hero.
export function setLeftTool(state: GameState, tool: ActiveTool): void {
    for (const hero of [state.hero, ...state.hero.clones]) {
        hero.leftTool = tool;
    }
}

// Function to set the right tool on all copies of the hero.
export function setRightTool(state: GameState, tool: ActiveTool): void {
    for (const hero of [state.hero, ...state.hero.clones]) {
        hero.rightTool = tool;
    }
}

// Function to set the equipped boots on all copies of the hero.
export function setEquippedBoots(state: GameState, boots: Equipment): void {
    for (const hero of [state.hero, ...state.hero.clones]) {
        hero.equippedBoots = boots;
    }
}

// Function to set the equipped element on all copies of the hero.
export function setEquippedElement(state: GameState, element: MagicElement): void {
    for (const hero of [state.hero, ...state.hero.clones]) {
        hero.setElement(element);
    }
}
