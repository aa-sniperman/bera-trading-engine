import { HOLD_ADDRESS, NATIVE, TokenConfig, WRAPPED_NATIVE } from "./constants";
import { FundDistribution } from "./fund-distribution";
import { Keys } from "./keys";
import { VolumeMakerV2 } from "./vol-maker/vol-v2";
import { BERA } from "./secrets/treasury-keys.json";
import { parseEther, Wallet } from "ethers";
import { Token } from "./token";
import { randomArrayWithSum } from "./utils";
import { HoldsoMixTrade } from "./holdso/mixswap";

async function main() {
    const middleKeys = require('src/secrets/bera/middle-keys.json') as Keys.WalletKey[];
    const makers = require('src/secrets/bera/vol-keys.json') as Keys.WalletKey[];

    // await FundDistribution.distribute(
    //     {
    //         index: 0,
    //         privateKey: BERA,
    //         address: (new Wallet(BERA)).address
    //     },
    //     HOLD_ADDRESS,
    //     middleKeys.slice(0, 3),
    //     makers.slice(0, 10),
    //     randomArrayWithSum(10, 2790, 250, 310).map(n => parseEther(n.toString()))
    // )

    // const balances = await Token.getBalances(
    //     makers.map(k => k.address),
    //     [HOLD_ADDRESS, WRAPPED_NATIVE, NATIVE],
    //     ['HOLD', 'WBERA', 'BERA']
    // )
    // console.log(balances);

    // HoldsoMixTrade.mixSwapMultiWallets(makers.slice(0, 10).map(k => k.privateKey), 10);

    const volMaker = new VolumeMakerV2.Maker(makers, HOLD_ADDRESS, TokenConfig.BERA, {
        targetVol1h: 40000,
        minTradeSize: 30,
        timeScale: 100,
        maxWalletsNum: 30,
        disableRebalancing: true
    })
    await volMaker.run();
}

main().then();