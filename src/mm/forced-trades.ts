import { getRandom, getRandomInt, randomArrayWithSum, sleep } from "src/utils";
import { MMWalletsManager } from "./mm-wallets";
import { parseEther, Wallet } from "ethers";
import { TokenStats } from "src/token-stats";
import { TokenConfigInfo } from "src/constants";

export namespace ForcedTrades {

    export async function forceTradeByVol(
        walletManager: MMWalletsManager,
        vol: number,
        isBuy: boolean,
        duration: number,
        numOfTrades: number
    ) {
        if (numOfTrades < 1) throw new Error('Must excecute at least 1 trade');
        const avgInterval = Math.floor(duration / (numOfTrades - 1));
        const timeGaps = randomArrayWithSum(
            numOfTrades - 1,
            duration,
            Math.floor(avgInterval * 0.8),
            Math.floor(avgInterval * 1.2)
        )
        const oneTradeVols = randomArrayWithSum(
            numOfTrades,
            vol,
            Math.floor(vol * 0.5),
            Math.floor(vol * 1.5)
        )

        let i = 0;
        while (i < oneTradeVols.length) {
            const volForTrade = oneTradeVols[i];

            try {
                await walletManager.executeSwap(
                    isBuy,
                    parseEther(volForTrade.toString())
                )
            } catch (err) {
                console.log(err);
            }
            if (i < timeGaps.length)
                await sleep(timeGaps[i]);
        }
    }

    export async function forceTradeUntilMC(
        walletManager: MMWalletsManager,
        maxTradeSize: number,
        minTradeSize: number,
        maxTotalTradeSize: number,
        targetMC: number,
    ) {
        let totalTradeSize: number = 0;
        const marketData = await TokenStats.getOverallMarketData(walletManager.baseConfig.pair);
        if (!marketData) throw new Error('Cant fetch market data for base');
        let { mc, price: basePrice } = marketData;
        const quotePrice = await TokenStats.getTokenPrice(walletManager.quoteConfig.pair);
        if (!quotePrice) throw new Error('Cant fetch market data for quote');
        const isBuy = mc < targetMC;

        do {
            const tradeSize = getRandom(minTradeSize, maxTradeSize);
            const tradeValue = Math.floor(tradeSize / (isBuy ? quotePrice : basePrice));

            try {
                await walletManager.executeSwap(
                    isBuy,
                    parseEther(tradeValue.toString())
                )
                totalTradeSize += tradeSize;
            } catch (err) {

            }
            const marketData = await TokenStats.getOverallMarketData(walletManager.baseConfig.pair);
            if (marketData) {
                mc = marketData.mc;
                basePrice = marketData.price;
            }
        } while (isBuy === (mc < targetMC) && totalTradeSize < maxTotalTradeSize);
    }

    export interface RangeTradingParams {
        tpMC: number,
        stopTpMC: number,
        dipMC: number,
        stopDipMC: number,
        maxTradeSize: number,
        minTradeSize: number,
        maxTotalTradeSize: number,
        onlyTP: boolean,
        onlyDip: boolean
    }
    export async function tradeInRange(
        walletManager: MMWalletsManager,
        params: RangeTradingParams
    ) {
        while (true) {
            try {
                const marketData = await TokenStats.getOverallMarketData(walletManager.baseConfig.pair);
                if (!marketData) continue;
                let { mc } = marketData;
                if (!params.onlyTP && mc < params.dipMC) {
                    // buy dip
                    await forceTradeUntilMC(walletManager, params.maxTradeSize, params.minTradeSize, params.maxTotalTradeSize, params.stopDipMC);
                }
                else if (!params.onlyDip && mc > params.tpMC) {
                    // take profit
                    await forceTradeUntilMC(walletManager, params.maxTradeSize, params.minTradeSize, params.maxTotalTradeSize, params.stopTpMC);
                }
            } catch (err) {

            }
        }
    }
}