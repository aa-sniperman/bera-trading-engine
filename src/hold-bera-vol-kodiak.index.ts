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

    // const amounts = randomArrayWithSum(10, 1500, 140, 160);
    // await Token.batchFastTransferToken(
    //     new Wallet(BERA, PROVIDER),
    //     HOLD_ADDRESS,
    //     amounts.map(a => parseEther(a.toString())),
    //     makers.slice(0, 10).map(m => m.address)
    // )

    // const balances = await Token.getBalances(
    //     makers.slice(0, 10).map(k => k.address),
    //     [HOLD_ADDRESS, WRAPPED_NATIVE, NATIVE],
    //     ['HOLD', 'WBERA', 'BERA']
    // )
    // console.log(balances);

    // HoldsoMixTrade.mixSwapMultiWallets(makers.slice(0, 10).map(k => k.privateKey), 10);

    const volMaker = new VolumeMakerV2.KodiakMaker(makers, HOLD_ADDRESS, TokenConfig.BERA, {
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