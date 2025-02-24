import { parseEther, Wallet } from "ethers";
import { Keys } from "./keys";
import { MemeSniper } from "./meme/sniper";
import { HoldSoSniper } from "./holdso/sniper";
import { Token } from "./token";
import { HOLD_ADDRESS, NATIVE, PROVIDER, TokenConfig } from "./constants";
import { env } from "./configs";
import { HoldsoMixTrade } from "./holdso/mixswap";
import { MemeSwap } from "./meme/swap";
import { HoldsoSwap } from "./holdso/swapper";
import { ISwapRouter } from "src/contracts/HoldsoRouter";

import outsideSnipers from "./outside-snipers.json";
import { MemeLauncher } from "./meme/launcher";
import { sleep } from "./utils";

const buyerKeys = require('src/secrets/henlo/sniper-keys.json') as Keys.WalletKey[]
const sniperKeys = buyerKeys.slice(0, 10);
const publicSniperKeys = buyerKeys.slice(20, 30);
const dexSniperKeys = buyerKeys.slice(10, 15);

async function checkBalances() {
    const balances = await Token.getBalances(
        sniperKeys.concat(dexSniperKeys).map(k => k.address),
        [HOLD_ADDRESS, NATIVE],
        ['HOLD', 'BERA']
    )
    console.log(balances)
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

async function token() {
    const tokenData = await MemeLauncher.getValidTokenId();
    if(!tokenData) throw new Error("Failed to get valid token");
    
    const pump = await MemeSwap.getPumpTest(tokenData.tokenId);

    console.log(tokenData, pump);
}

async function launch() {
    const tokenId = '1740370527694847870028880042302903965871802884753640855430525528531';
    const token = '0x55da3d95a38759453161dDDfA412Fdf4C41E23fe';
    const pump = '0xAe038Ad867E9F6350427Bcec5F2B8c652e5beCCF';
    const pk = env.keys.pk;
    const wallet = new Wallet(pk, PROVIDER);
    const dexSniper = new HoldSoSniper.Sniper(
        dexSniperKeys.map(k => k.privateKey),
        dexSniperKeys.map(k => parseEther('100'))
    )

    const memeSniper = new MemeSniper.SniperV2(
        Keys.walletKeysToWallets(sniperKeys),
        sniperKeys.map(k => parseEther('100')),
        token,
        pump,
        dexSniper
    )

    const block = await PROVIDER.getBlock('latest');
    await memeSniper.preApprove();
    await memeSniper.setup();
    await dexSniper.setup();
    await sleep(1000);
    await MemeLauncher.createMeme(wallet, tokenId, token);
    memeSniper.batchBuy();
    await dexSniper.run(pump, token, block!.number);
}

async function launchWl() {
    const tokenId = '1740372460356563186454405627138326806197316553669130418616900448764';
    const token = '0x4a6aB2B3Da5bBe78aAF410CfF7e9362AFBb658a2';
    const pump = '0xA4D61D50dDA46D731D39d73049C0414979f42524';

    const dexSniper = new HoldSoSniper.Sniper(
        dexSniperKeys.map(k => k.privateKey),
        dexSniperKeys.map(k => parseEther('100'))
    )
    const nowInSecs = Math.floor(Date.now() / 1000);
    const timeline = {
        whitelistStartTs: nowInSecs,
        whitelistEndTs: nowInSecs + 60,
        stakeEndTs: nowInSecs,
        lockEndTs: nowInSecs
    }
    const memeSniper = new MemeSniper.PublicSniper(
        Keys.walletKeysToWallets(sniperKeys),
        pump,
        token,
        sniperKeys.map(k => parseEther('100')),
        timeline.whitelistEndTs,
        dexSniper
    )
    memeSniper.run();
    await sleep(5000);
    const pk = env.keys.pk;
    const wallet = new Wallet(pk, PROVIDER);
    await MemeLauncher.createWhitelistMeme(wallet, HOLD_ADDRESS, tokenId, token, timeline);
}

async function mix() {
    await HoldsoMixTrade.mixSwapMultiWallets(buyerKeys.map(k => k.privateKey), 10);
}

async function sell() {
    const wallet = new Wallet(buyerKeys[9].privateKey, PROVIDER);
    await HoldsoSwap.executeSwap(wallet.privateKey, {
        tokenIn: TokenConfig.HENLO.address,
        tokenOut: HOLD_ADDRESS,
        fee: 3000,
        recipient: wallet.address,
        deadline: Date.now() + 60000,
        amountIn: parseEther((3_500_000).toString()),
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
    })
}

sell().then();
