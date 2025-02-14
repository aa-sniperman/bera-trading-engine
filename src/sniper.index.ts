import { parseEther, Wallet } from "ethers";
import { Keys } from "./keys";
import { MemeSniper } from "./meme/sniper";
import { HoldSoSniper } from "./holdso/sniper";
import { Token } from "./token";
import { HOLD_ADDRESS, NATIVE } from "./constants";

const buyerKeys = require('src/secrets/bb/buyers.json') as Keys.WalletKey[]
const sniperKeys = buyerKeys.slice(0, 5);
const publicSniperKeys = buyerKeys.slice(5, 10);
const dexSniperKeys = buyerKeys.slice(10, 15);
const allKeys = sniperKeys.concat(publicSniperKeys).concat(dexSniperKeys);

async function checkBalances() {
    const balances = await Token.getBalances(
        allKeys.map(k => k.address),
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
    const whitelistAmounts = sniperKeys.map(k => parseEther((5e6.toString())));
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
    await wlSniper.run();

    // Manual buy for whitelsit round
    // await wlSniper.preApprove();
    // await wlSniper.prepare();
    // await wlSniper.batchBuy();

    await publicSniper.run();

    // Manual buy for public round
    // await publicSniper.preApprove();
    // await publicSniper.prepare();
    // await publicSniper.batchBuy();

    // Manual buy for dex sniper
    // await dexSniper.setup();
    // await dexSniper.batchBuy('0x2443c2be245A39bE641F45A701269039363D103E', 3000);
}
// launch().then();
// buy().then();
runAllSnipers(
    '0x807407Abbe1373995BeA41f55c32eCC2e24a1283',
    '0x2443c2be245A39bE641F45A701269039363D103E',
    1739521035,
    1739521335
).then();