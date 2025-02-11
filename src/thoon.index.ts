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
    //     makers.slice(50, 60),
    //     randomArrayWithSum(10, 1520, 140, 160).map(n => parseEther(n.toString()))
    // )

    // const balances = await Token.getBalances(
    //     makers.slice(50, 60).map(k => k.address),
    //     [HOLD_ADDRESS, NATIVE, TokenConfig.THOON.address],
    //     ['HOLD', 'BERA', 'THOON']
    // )
    // console.log(balances);

    // HoldsoMixTrade.mixSwapMultiWallets(makers.slice(0, 10).map(k => k.privateKey), 10);

    const volMaker = new VolumeMakerV2.Maker(makers.slice(50, 80), HOLD_ADDRESS, TokenConfig.THOON, {
        targetVol1h: 50000,
        minTradeSize: 20,
        timeScale: 10,
        maxWalletsNum: 10,
        disableRebalancing: true
    })
    await volMaker.run();
}

main().then();