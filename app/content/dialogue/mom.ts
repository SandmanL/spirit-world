import { dialogueHash } from 'app/content/dialogue/dialogueHash';

dialogueHash.mom = {
    key: 'mom',
    options: [
        {
            logicCheck: {
                requiredFlags: ['$spiritSight'],
                excludedFlags: [],
            },
            isExclusive: true,
            text: [
                `So you've learned to look into the spirit world...
                {|}It is forbidden to speak of, but my ancestors gained great powers by summoning beings from the spirit world.
                {|}They say the ruins in the Southeast are where the ancient summoners lived.
                {|}Perhaps you can find something there to help you.`,
                `I'm sure you can find what you need in the summoner ruins to the Southeast!`,
            ],
        },
        {
            logicCheck: {
                requiredFlags: [],
                excludedFlags: ['$staff'],
            },
            text: [
                `Welcome home son!
                {|}Our cave is under development, try again later!
                {|}Talk to me again if you want a hint.`,
                `I'm your mom. I'm a human disguised as a Vanara...
                {|}Actually I just don't have my own graphics yet!
                {|}You should head Southwest to the Vanara Village if you want to learn more about your powers.`,
                `That's all I have to tell you for now!`,
                `...`,
                `You still want something?`,
                `Okay, here is a surprise! {staff:1}`,
            ],
            repeatIndex: 0,
        },
        {
            logicCheck: {
                requiredFlags: ['$staff'],
                excludedFlags: [],
            },
            text: [
                `Enjoy the present!`,
                `Remember to visit the Vanara Village to the Southwest.`,
            ],
            repeatIndex: 0,
        },
    ],
};