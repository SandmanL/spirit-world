import { LogicNode } from 'app/types';

import {
    andLogic, orLogic, canHasTowerStaff, canTravelFarUnderWater,
    hasAstralProjection, hasBossWeapon, hasSpiritSight,
    hasInvisibility, hasCloudBoots, hasMitts, hasClone, hasStaff, hasSomersault, hasTeleportation, hasTrueSight,
} from 'app/content/logic';

const zoneId = 'gauntlet';
export const gauntletNodes: LogicNode[] = [
    {
        zoneId,
        nodeId: 'gauntletSecretEntrance',
        checks: [
            { objectId: 'gauntletPeachPiece' },
        ],
        paths: [
            {nodeId: 'gauntletWaterEntrance', logic: canTravelFarUnderWater},
        ],
    },
    {
        zoneId,
        nodeId: 'gauntletEntrance',
        paths: [
            // Player must hit two switches to reveal the teleporter to the spirit world here.
            {nodeId: 'gauntletSpiritEntrance', logic: orLogic(hasClone, hasStaff)},
            // This door is locked in standard, the key is in the spirit world entrance.
            {nodeId: 'gauntletBigChest', doorId: 'gauntletFirstLock'},
            {nodeId: 'gauntletWaterEntrance', logic: canTravelFarUnderWater},
        ],
        entranceIds: ['gauntletEntrance'],
        exits: [
            {objectId: 'gauntletEntrance'},
        ],
    },
    {
        zoneId,
        nodeId: 'gauntletBigChest',
        checks: [{objectId: 'gauntletTrueSight'}],
        paths: [{nodeId: 'gauntletBetweenKeyBlocks', doorId: 'gauntletKeyBlockA'}],
        entranceIds: ['gauntletLeftStairs', 'gauntletStairs',  'gauntletRightStairs', 'gauntletPitMarker'],
        exits: [
            {
                objectId: 'gauntletLeftStairs',
                logic: orLogic(hasMitts, hasClone)
            },
            {
                objectId: 'gauntletStairs',
            },
            {
                objectId: 'gauntletRightStairs',
                // There are many ways to climb this escalator...
                logic: orLogic(hasInvisibility, hasCloudBoots, hasSomersault, hasTeleportation, hasClone)
            },
        ],
    },
    {
        zoneId,
        nodeId: 'gauntletBetweenKeyBlocks',
        paths: [{nodeId: 'gauntletBigKey', doorId: 'gauntletKeyBlockB'}],
    },
    {
        zoneId,
        nodeId: 'gauntletBigKey',
        checks: [{objectId: 'gauntletBigKey'}],
    },
    {
        zoneId,
        nodeId: 'gauntletLeftRoom',
        checks: [
            {objectId: 'gauntletLeftKey'},
            {objectId: 'gauntletMoney', logic: hasStaff}
        ],
        entranceIds: ['gauntletLeftStairs'],
        exits: [{ objectId: 'gauntletLeftStairs' }],
    },
    {
        zoneId,
        nodeId: 'gauntletRightRoom',
        checks: [
            {objectId: 'gauntletRightKey'},
            {objectId: 'gauntletGold', logic: orLogic(canHasTowerStaff, andLogic(hasClone, hasStaff))}
        ],
        entranceIds: ['gauntletRightStairs'],
        exits: [{ objectId: 'gauntletRightStairs' }],
    },
    {
        zoneId,
        nodeId: 'gauntletBallRoom',
        entranceIds: ['gauntletStairs'],
        exits: [
            { objectId: 'gauntletStairs' },
            { objectId: 'gauntletPit', logic: {requiredFlags: ['gauntletPit']} }
        ],
        // The player needs true sight to determine the correct ball goals.
        // The player may need astral projection in order to move balls in the spirit world.
        // Setting this flag is necessary to use the corresponding pit entrance in the spirit world.
        flags: [{flag: 'gauntletPit', logic: andLogic(hasTrueSight, hasAstralProjection)}],
    },
    {
        zoneId: 'gauntletWater',
        nodeId: 'gauntletWaterEntrance',
        paths: [
            {nodeId: 'gauntletEntrance', logic: canTravelFarUnderWater},
            {nodeId: 'gauntletSecretEntrance', logic: canTravelFarUnderWater},
        ],
        entranceIds: [
            'gauntletWaterEntrance',
        ],
        exits: [
            { objectId: 'gauntletWaterEntrance', logic: canTravelFarUnderWater },
        ],
    },
    {
        zoneId,
        nodeId: 'gauntletSpiritEntrance',
        checks: [
            // This is in an invisible chest to the left
            {objectId: 'gauntletPeachPiece', logic: hasTrueSight},
            // Sitting in the open on the right.
            {objectId: 'gauntletFirstKey'},
        ],
        paths: [
            // The portal back to the material world just requires spirit sight to use.
            {nodeId: 'gauntletEntrance', logic: hasSpiritSight},
            // True sight is needed to open the door north to the hallway
            {nodeId: 'gauntletSpiritHallway', logic: hasTrueSight},
        ],
    },
    {
        zoneId,
        nodeId: 'gauntletSpiritHallway',
        paths: [
            {nodeId: 'gauntletSpiritEntrance'},
            // The player must defeat a crystal guardian to proceed north.
            {nodeId: 'gauntletSpiritLargeRoom', logic: hasBossWeapon},
        ],
    },
    {
        zoneId,
        nodeId: 'gauntletSpiritLargeRoom',
        paths: [
            // The player must defeat a crystal guardian to proceed south.
            {nodeId: 'gauntletSpiritHallway', logic: hasBossWeapon},
        ],
        exits: [
            // Blocked by two crystal guardians and two bats.
            { objectId: 'gauntletSpiritStairs', logic: hasBossWeapon },
        ],
        entranceIds: ['gauntletSpiritStairs']
    },
    {
        zoneId,
        nodeId: 'gauntletSpiritBallRoom',
        exits: [
            { objectId: 'gauntletSpiritStairs' },
            { objectId: 'gauntletPit', logic: {requiredFlags: ['gauntletPit']} },
        ],
        entranceIds: ['gauntletSpiritStairs']
    },
    {
        zoneId,
        nodeId: 'gauntletSpiritStage',
        npcs: [
            {loot: {type: 'dialogueLoot', id: 'grandPriest', lootType: 'ironSkin'}},
        ],
        paths: [
            // The player can just jump off the stage.
            {nodeId: 'gauntletSpiritLargeRoom'},
        ],
        entranceIds: ['gauntletSpiritPitMarker']
    },
];