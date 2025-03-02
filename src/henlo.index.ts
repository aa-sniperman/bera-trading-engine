import { HOLD_ADDRESS, NATIVE, PROVIDER, TokenConfig, WRAPPED_NATIVE } from "./constants";
import { FundDistribution } from "./fund-distribution";
import { Keys } from "./keys";
import { VolumeMakerV2 } from "./vol-maker/vol-v2";
import { BERA } from "./secrets/treasury-keys.json";
import { parseEther, Wallet } from "ethers";
import { Token } from "./token";
import { getRandomInt, randomArrayWithSum } from "./utils";
import { HoldsoMixTrade } from "./holdso/mixswap";
import { HoldsoAggSwapper } from "./holdso/agg-swapper";
import { HoldsoSwap } from "./holdso/swapper";
import { writeFileSync } from "fs";
import { BoostHoldersViaSwap } from "./vol-maker/boost-holders";

async function main() {
    const middleKeys = require('src/secrets/bera/middle-keys.json') as Keys.WalletKey[];
    const makers = require('src/secrets/bera/vol-keys.json') as Keys.WalletKey[];
    const snipers = require('src/secrets/henlo/sniper-keys.json') as Keys.WalletKey[];
    const holders = require('src/secrets/thoon/holder-keys.json') as Keys.WalletKey[];

    // const balances = await Token.getBalances(snipers.map(s => s.address), [TokenConfig.HENLO.address, HOLD_ADDRESS], [TokenConfig.HENLO.symbol, 'HOLD']);

    // console.log(balances);

    // await Token.batchFastTransferToken(
    //     new Wallet(snipers[1].privateKey, PROVIDER),
    //     TokenConfig.HENLO.address,
    //     holders.map(a => parseEther('1000')),
    //     holders.map(k => k.address),
    // )
    // let holderIdx = 0;

    // for(const sniper of snipers){
    //     const sniperWallet = new Wallet(sniper.privateKey, PROVIDER);
    //     const bal = Number(balances[sniperWallet.address][TokenConfig.HENLO.symbol]);
    //     const remainingAmount = getRandomInt(20_000_000, 25_000_000);
    //     if(bal < remainingAmount) continue;
    //     const totalDistribution = Math.floor(bal) - remainingAmount;
    //     const numOfHolders = Math.floor(totalDistribution / 9_000_000);
    //     const dstKeys = holders.slice(holderIdx, holderIdx + numOfHolders);
    //     holderIdx += numOfHolders;
    //     const amounts = randomArrayWithSum(numOfHolders, totalDistribution, 8_000_000, 10_000_000);
    //     console.log(amounts, dstKeys.map(k => k.address))
    //     await Token.batchFastTransferToken(
    //         sniperWallet,
    //         TokenConfig.HENLO.address,
    //         amounts.map(a => parseEther(a.toString())),
    //         dstKeys.map(k => k.address),
    //     )
    // }
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

    // // HoldsoMixTrade.mixSwapMultiWallets(makers.slice(0, 10).map(k => k.privateKey), 10);

    const volMaker = new VolumeMakerV2.Maker(makers, HOLD_ADDRESS, TokenConfig.HENLO, {
        targetVol1h: 10000,
        minTradeSize: 10,
        maxTradeSize: 100,
        timeScale: 6000,
        maxWalletsNum: 10,
        disableRebalancing: true
    })
    await volMaker.run();

}

main().then();