import {
    andLogic,
    canCrossDynamic4Gaps,
    canReleaseBeasts,
    hasBossWeapon,
    hasCloudBoots,
    hasClone,
    hasIce,
    hasStaff,
    hasTeleportation,
    orLogic,
} from 'app/content/logic';

import {LogicNode } from 'app/types';

const zoneId = 'staffTower';
export const staffTowerNodes: LogicNode[] = [
    {
        zoneId,
        nodeId: 'staffTowerF1Downstairs',
        paths: [
            {nodeId: 'staffTowerF1Upstairs', logic: orLogic(hasIce, hasCloudBoots, hasClone)}
        ],
        entranceIds: ['staffTowerEntrance'],
        exits: [{objectId: 'staffTowerEntrance'}],
    },
    {
        zoneId,
        nodeId: 'staffTowerF1Upstairs',
        paths: [
            {nodeId: 'staffTowerF1Downstairs'},
            // Power is only on after the storm beast is released.
            {nodeId: 'staffTowerF1Spirit', logic: canReleaseBeasts},
        ],
    },
    {
        zoneId,
        nodeId: 'staffTowerF1Spirit',
        paths: [
            // Power is only on after the storm beast is released.
            {nodeId: 'staffTowerF1Upstairs', logic: canReleaseBeasts},
            // Always in logic since this is the default tower location
            {nodeId: 'mainSpiritWorld'},
            // Other exits don't need logic since they have to already be in logic to move the tower to them.
        ],
        entranceIds: ['staffTower1F2F'],
        exits: [{objectId: 'staffTower1F2F'}],
    },
    {
        zoneId,
        nodeId: 'staffTowerF2SpiritMain',
        paths: [
            {nodeId: 'staffTowerF2'},
        ],
        // This is one way entrance because of the cliff after the door.
        entranceIds: ['staffTower1F2F'],
    },
    {
        zoneId,
        nodeId: 'staffTowerF2',
        checks: [
            { objectId: 'staffTowerSmallMoney1', logic: orLogic(hasStaff, hasCloudBoots) },
        ],
        // This is blocked as an entrance because of the lightning barrier.
        // Can eventually remove this and split the upper area and allow invisibility to move past the barrier.
        exits: [{objectId: 'staffTower2F3F'}],
    },
    {
        zoneId,
        nodeId: 'staffTowerF3West',
        checks: [
            // You have to cross a 4 gap from a conveyer belt to reach this chest.
            { objectId: 'staffTowerBigMoney1', logic: canCrossDynamic4Gaps },
        ],
        paths: [
            {nodeId: 'staffTowerF3SpiritWest'},
        ],
        entranceIds: ['staffTower2F3F'],
    },
    {
        zoneId,
        nodeId: 'staffTowerF3SpiritWest',
        exits: [{objectId: 'tower3FPit'}],
    },
    {
        zoneId,
        nodeId: 'staffTowerF2SpiritElevator',
        paths: [
            {nodeId: 'staffTowerB1Spirit'},
        ],
        entranceIds: ['tower2FMarker'],
    },
    {
        zoneId,
        nodeId: 'staffTowerB1Spirit',
        checks: [
            { objectId: 'elevatorFixed', logic: hasBossWeapon },
        ],
        paths: [
            {nodeId: 'staffTowerF1Spirit', logic: hasBossWeapon},
            {nodeId: 'staffTowerF3SpiritElevator', logic: hasBossWeapon},
            {nodeId: 'staffTowerF4Spirit', logic: hasBossWeapon},
            {nodeId: 'staffTowerF5SpiritElevator', logic: hasBossWeapon},
        ],
    },
    {
        zoneId,
        nodeId: 'staffTowerF3SpiritElevator',
        checks: [
            { objectId: 'staffTowerBigMoney2' },
        ],
    },
    {
        zoneId,
        nodeId: 'staffTowerF4Spirit',
        paths: [
            {nodeId: 'staffTowerF4', logic: canReleaseBeasts},
        ],
        entranceIds: [
            'staffTowerSpiritSkyEntrance',
            'staffTower3F4F',
        ],
        exits: [
            {objectId: 'staffTower3F4F'},
            {objectId: 'staffTowerSpiritSkyEntrance'},
        ],
    },
    {
        zoneId,
        nodeId: 'staffTowerF3SpiritEast',
        paths: [
            {nodeId: 'staffTowerF3East', logic: canReleaseBeasts},
        ],
        entranceIds: ['staffTower3F4F'],
        exits: [{objectId: 'staffTower3F4F'}],
    },
    {
        zoneId,
        nodeId: 'staffTowerF3East',
        checks: [
            // This doesn't require cloud boots after defeating the `stormBeast`, but that isn't capture here yet.
            { objectId: 'staffTowerPeachPiece', logic: hasCloudBoots },
        ],
        paths: [
            {nodeId: 'staffTowerF3West'},
        ],
    },
    {
        zoneId,
        nodeId: 'staffTowerF5SpiritElevator',
        exits: [
            {objectId: 'staffTowerRoof', logic: andLogic(hasBossWeapon, hasStaff, hasTeleportation)},
        ],
    },
    {
        zoneId,
        // This covers both spirit/material versions since they are both connected once the boss is defeated
        nodeId: 'staffTowerRoof',
        checks: [
            //
            { objectId: 'stormBeast', logic: hasBossWeapon },
        ],
        entranceIds: ['staffTowerRoof'],
    },
    {
        zoneId,
        nodeId: 'staffTowerF4',
        exits: [
            {objectId: 'staffTowerSkyEntrance'},
        ],
        // This leads to the terminal to acquire the staff, but there are no actual checks here, so I'm not filling this in for now.
        // This also has the
    },
];