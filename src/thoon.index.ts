import { HOLD_ADDRESS, NATIVE, PROVIDER, TokenConfig, WRAPPED_NATIVE } from "./constants";
import { FundDistribution } from "./fund-distribution";
import { Keys } from "./keys";
import { VolumeMakerV2 } from "./vol-maker/vol-v2";
import { BERA } from "./secrets/treasury-keys.json";
import { parseEther, Wallet } from "ethers";
import { Token } from "./token";
import { randomArrayWithSum } from "./utils";
import { HoldsoMixTrade } from "./holdso/mixswap";
import { HoldsoAggSwapper } from "./holdso/agg-swapper";
import { HoldsoSwap } from "./holdso/swapper";
import { writeFileSync } from "fs";

async function main() {
    const middleKeys = require('src/secrets/bera/middle-keys.json') as Keys.WalletKey[];
    const makers = require('src/secrets/bera/vol-keys.json') as Keys.WalletKey[];

    // await Token.transferToken(new Wallet(middleKeys[2].privateKey, PROVIDER), HOLD_ADDRESS, parseEther('150'), middleKeys[3].address);
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
    //     (middleKeys).concat(makers).map(k => k.address),
    //     [HOLD_ADDRESS, NATIVE, WRAPPED_NATIVE],
    //     ['HOLD', 'BERA', 'WBERA']
    // )
    // console.log(balances);
    // // HoldsoMixTrade.mixSwapMultiWallets(makers.slice(0, 10).map(k => k.privateKey), 10);

    const volMaker = new VolumeMakerV2.Maker(makers, HOLD_ADDRESS, TokenConfig.THOON, {
        targetVol1h: 50000,
        minTradeSize: 10,
        maxTradeSize: 100,
        timeScale: 4000,
        maxWalletsNum: 10,
        disableRebalancing: true
    })
    await volMaker.run();
}

main().then();