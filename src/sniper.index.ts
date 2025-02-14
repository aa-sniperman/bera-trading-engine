import { parseEther, Wallet } from "ethers";
import { Keys } from "./keys";
import { MemeSniper } from "./meme/sniper";
import { HoldSoSniper } from "./holdso/sniper";
import { Token } from "./token";
import { HOLD_ADDRESS, NATIVE, PROVIDER } from "./constants";
import { env } from "./configs";
import { HoldsoMixTrade } from "./holdso/mixswap";

const buyerKeys = require('src/secrets/athen/sniper-keys.json') as Keys.WalletKey[]
const sniperKeys = buyerKeys.slice(buyerKeys.length - 1);
const publicSniperKeys = buyerKeys.slice(5, 10);
const dexSniperKeys = buyerKeys.slice(10, 15);

async function checkBalances() {
    const balances = await Token.getBalances(
        buyerKeys.map(k => k.address),
        ['0x3262336B903F8DeCB1d9c9259138065d6c6E2e6F', HOLD_ADDRESS, NATIVE],
        ['ATI', 'HOLD', 'BERA']
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

async function mix() {
    await HoldsoMixTrade.mixSwapMultiWallets(buyerKeys.map(k => k.privateKey), 10);
}

checkBalances().then();

// mix().then();
// runAllSnipers(
//     '0x0D8ED695AB53F000041596677C899De62D41b681',
//     '0x3262336B903F8DeCB1d9c9259138065d6c6E2e6F',
//     1739534400,
//     1739538000
// ).then();