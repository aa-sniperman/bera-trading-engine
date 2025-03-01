import { parseEther, Wallet } from "ethers";
import { HOLD_ADDRESS, NATIVE, PROVIDER, TokenConfig, WRAPPED_NATIVE } from "./constants";
import { HoldsoSwap } from "./holdso/swapper";
import { Keys } from "./keys";
import { Token } from "./token";
import { VolumeMakerV2 } from "./vol-maker/vol-v2";
import {BERA} from "./secrets/treasury-keys.json";
import { randomArrayWithSum } from "./utils";

async function main() {
    const middleKeys = require('src/secrets/bera/middle-keys.json') as Keys.WalletKey[];
    const makers = require('src/secrets/bera/vol-keys.json') as Keys.WalletKey[];

    // const amounts = randomArrayWithSum(10, 3000, 280, 320);
    // await Token.batchFastTransferToken(
    //     new Wallet(BERA, PROVIDER),
    //     HOLD_ADDRESS,
    //     amounts.map(a => parseEther(a.toString())),
    //     makers.slice(0, 10).map(m => m.address)
    // )

    // const balances = await Token.getBalances(
    //     makers.map(k => k.address),
    //     ['0xFF0a636Dfc44Bb0129b631cDd38D21B613290c98' 
    //         // ...Object.values(TokenConfig).map(config => config.address)
    //     ],
    //     ['HOLD'
    //         // ...Object.values(TokenConfig).map(config => config.symbol)
    //     ]
    // )
    // console.log(balances);

    // HoldsoMixTrade.mixSwapMultiWallets(makers.slice(0, 10).map(k => k.privateKey), 10);

    const volMaker = new VolumeMakerV2.Maker(makers, HOLD_ADDRESS, TokenConfig.BERA, {
        targetVol1h: 50000,
        minTradeSize: 20,
        maxTradeSize: 100,
        timeScale: 1000,
        maxWalletsNum: 10,
        disableRebalancing: true
    })
    await volMaker.run();
}

main().then();