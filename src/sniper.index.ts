import { parseEther, Wallet } from "ethers";
import { Keys } from "./keys";
import { MemeSniper } from "./meme/sniper";
import { HoldSoSniper } from "./holdso/sniper";
import { Token } from "./token";
import { HOLD_ADDRESS, NATIVE, PROVIDER } from "./constants";
import { env } from "./configs";
import { HoldsoMixTrade } from "./holdso/mixswap";
import { MemeSwap } from "./meme/swap";
import { HoldsoSwap } from "./holdso/swapper";
import { ISwapRouter } from "src/contracts/HoldsoRouter";

import outsideSnipers from "./outside-snipers.json";

const buyerKeys = require('src/secrets/bb/buyers.json') as Keys.WalletKey[]
const sniperKeys = buyerKeys.slice(0, 10);
const publicSniperKeys = buyerKeys.slice(20, 30);
const dexSniperKeys = buyerKeys.slice(10, 15);

async function checkBalances() {
    const balances = await Token.getBalances(
        sniperKeys.concat(dexSniperKeys).map(k => k.address),
        [HOLD_ADDRESS, NATIVE],
        ['HOLD', 'BERA']
    )
    console.log(balances);
}
async function runAllSnipers(
    pump: string,
    token: string,
    whitelistStartTs: number,
    whitelistEndTs: number
) {
    const whitelistAmounts = sniperKeys.map(k => parseEther(((1e6).toString())));
    const publicAmounts = publicSniperKeys.map(k => parseEther('50'));
    const dexAmounts = dexSniperKeys.map(k => parseEther('50'));
    const wlSniper = new MemeSniper.WhitelistSniper(
        Keys.walletKeysToWallets(sniperKeys),
        pump,
        whitelistAmounts,
        whitelistStartTs
    );
    const dexSniper = new HoldSoSniper.Sniper(
        dexSniperKeys.map(k => k.privateKey),
        dexAmounts,
        3000
    );
    const publicSniper = new MemeSniper.PublicSniper(
        Keys.walletKeysToWallets(publicSniperKeys),
        pump,
        token,
        publicAmounts,
        whitelistEndTs,
        dexSniper
    );
    console.log(pump, token, whitelistStartTs, whitelistEndTs)
    console.log(whitelistAmounts)
    await wlSniper.run();

    // Manual buy for whitelsit round
    // await wlSniper.preApprove();
    // await wlSniper.prepare();
    // await wlSniper.batchBuy();

    // await publicSniper.run();

    // Manual buy for public round
    // await publicSniper.preApprove();
    // await publicSniper.prepare();
    // await publicSniper.batchBuy();

    // Manual buy for dex sniper
    // await dexSniper.setup();
    // await dexSniper.batchBuy('0x2443c2be245A39bE641F45A701269039363D103E', 3000);
}

async function sniper() {
    const dexSniper = new HoldSoSniper.Sniper(
        dexSniperKeys.map(k => k.privateKey),
        dexSniperKeys.map(k => parseEther('100'))
    )

    const memeSniper = new MemeSniper.Sniper(
        Keys.walletKeysToWallets(sniperKeys),
        sniperKeys.map(k => parseEther('100')),
        '0xEB5491C015b73C3B86F4B4a7E8982d97eC4628ff',
        dexSniper
    )

    await memeSniper.run();
}

async function mix() {
    await HoldsoMixTrade.mixSwapMultiWallets(buyerKeys.map(k => k.privateKey), 10);
}

async function sell() {
    const wallet = new Wallet(buyerKeys[0].privateKey, PROVIDER);
    await HoldsoSwap.executeSwap(wallet.privateKey, {
        tokenIn: '0x3262336B903F8DeCB1d9c9259138065d6c6E2e6F',
        tokenOut: HOLD_ADDRESS,
        fee: 3000,
        recipient: wallet.address,
        deadline: Date.now() + 60000,
        amountIn: parseEther((1e6).toString()),
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
    })
}

// sell().then();
sniper().then();

// buyOnCurve();
// mix().then();
// runAllSnipers(
//     '0x0D8ED695AB53F000041596677C899De62D41b681',
//     '0x3262336B903F8DeCB1d9c9259138065d6c6E2e6F',
//     1739534400,
//     1739538000
// ).then();