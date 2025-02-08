import axios from "axios";
import { Wallet } from "ethers";
import { NATIVE, PROVIDER, TokenConfigInfo } from "src/constants";
import { FundDistribution } from "src/fund-distribution";
import { DojoMixTrade } from "src/dojo/mix-trade";
import { DojoSwap } from "src/dojo/swap";
import { Keys } from "src/keys";
import { Token } from "src/token";
import { TokenStats } from "src/token-stats";
import { getRandomInt, sleep } from "src/utils";

export namespace VolumeMaker {
    async function makeOneRoundVolForKey(key: Keys.WalletKey, config: TokenConfigInfo, timeScale = 1000) {
        const numOfBuys = getRandomInt(1, 4);
        await sleep(getRandomInt(20 * timeScale, 70 * timeScale));
        for (let i = 0; i < numOfBuys; i++) {
            try {
                const quoteBal = await Token.getTokenBalance(key.address, NATIVE);
                const buyPercent = getRandomInt(60, 90);
                const buyAmount = quoteBal * BigInt(buyPercent) / 100n;

                console.log(`Wallet ${key.address} buying with ${buyAmount} Metis...`)
                const wallet = new Wallet(key.privateKey, PROVIDER);
                const hash = await DojoSwap.buyTokenWithA8(
                    wallet,
                    config.address,
                    buyAmount
                );
                console.log(hash);
                await sleep(getRandomInt(30 * timeScale, 40 * timeScale));
            } catch (err) {
                console.log(err);
            }
        }

        let attempts = 0;
        let sellSuccess = false;
        do {
            try {
                const baseBal = await Token.getTokenBalance(key.address, config.address);

                const sellAmount = baseBal * 995n / 1000n;

                console.log(`Wallet ${key.address} selling ${sellAmount} ${config.symbol}...`)
                const wallet = new Wallet(key.privateKey, PROVIDER);
                const hash = await DojoSwap.sellTokenToA8(wallet, config.address, sellAmount);
                console.log(hash);
                sellSuccess = true;
            } catch (err) {
                console.log(err);
                attempts++;
            }
        } while (attempts < 3 && !sellSuccess);
        await sleep(getRandomInt(50 * timeScale, 90 * timeScale));
    }

    export async function runVolForAMakerSet(makerIdx: number, keys: Keys.WalletKey[], config: TokenConfigInfo, rounds: number, timeScale = 1000) {
        console.log(keys.map(k => k.address))

        for (let i = 0; i < rounds; i++) {
            const balances = await Token.getBalances(
                keys.map(k => k.address),
                [
                    NATIVE
                ],
                [
                    'METIS'
                ]
            )
            console.log(balances)
            const totalQuoteLeft = Number(balances['total']['METIS']);
            if (totalQuoteLeft < 5) {
                console.log(`Insufficient balance at set ${makerIdx}`)
                return false;
            }
            console.log(`---------------- Set ${makerIdx}, Round ${i} -------------------`);
            await Promise.all(keys.map(key => makeOneRoundVolForKey(key, config, timeScale)))
        }
        return true;
    }

    export async function run(targetVol: number, makerSets: Keys.WalletKey[][], config: TokenConfigInfo, startingIdx: number, roundsPerSet = 3, timeScale = 1000) {
        let curVol: number
        let setIdx = startingIdx;
        do {

            curVol = await TokenStats.get1hVolume(config.pair)
            console.log(`Current vol: ${curVol}`);
            if (curVol >= targetVol) {
                console.log(`Done. SetIdx: ${setIdx}`);
                await sleep(30000);
                continue;
            };
            console.log(`Making vol with maker set: ${setIdx}`);
            const keys = makerSets[setIdx];
            const sufficientBalance = await runVolForAMakerSet(setIdx, keys, config, roundsPerSet, timeScale);
            if (!sufficientBalance) {
                return;
            }

            const nextSetIdx = (setIdx + 1) % makerSets.length;
            const nextKeys = makerSets[nextSetIdx];
            await FundDistribution.migrateMMFunds(keys, nextKeys);
            console.log(`------------------------------------------------------`);
            console.log(`Migrated funds from set ${setIdx} to set ${nextSetIdx}`);
            await sleep(30000);
            await DojoMixTrade.mixSwapMultiWallets(nextKeys.map(k => k.privateKey), 3);
            console.log(`------------------------------------------------------`);
            console.log(`Done mix swap for set ${setIdx}`);
            await sleep(20000);
            setIdx = nextSetIdx;

        } while (true);
    }
}