import { parseEther, Wallet } from "ethers";
import { env } from "./configs";
import { Keys } from "./keys";
import { MemeSniper } from "./meme/sniper";
import { HOLD_ADDRESS, NATIVE, PROVIDER } from "./constants";
import { FundDistribution } from "./fund-distribution";
import { Token } from "./token";
import { HoldsoMixTrade } from "./holdso/mixswap";
import { HoldsoSwap } from "./holdso/swapper";
import { HoldSoSniper } from "./holdso/sniper";

async function distribute() {
    const middleKeys = require('src/secrets/besa/middle-keys.json') as Keys.WalletKey[];
    const sniperKeys = require('src/secrets/besa/end-keys.json') as Keys.WalletKey[];

    const pk = env.keys.pk;
    const wallet = new Wallet(pk, PROVIDER);
    // await FundDistribution.distribute(
    //     {
    //         index: 0,
    //         privateKey: pk,
    //         address: wallet.address
    //     },
    //     NATIVE,
    //     middleKeys,
    //     sniperKeys,
    //     sniperKeys.map(k => parseEther('0.1'))
    // )

    const balances = await Token.getBalances(
        sniperKeys.map(k => k.address),
        [HOLD_ADDRESS, NATIVE],
        ['HOLD', 'BERA']
    )
    console.log(balances);
}

async function sniper() {
    const sniperKeys = require('src/secrets/besa/end-keys.json') as Keys.WalletKey[];
    const sniperWallets = Keys.walletKeysToWallets(sniperKeys);
    const dexSniper = new HoldSoSniper.Sniper([], []);
    const pumpSniper = new MemeSniper.Sniper(sniperWallets, sniperWallets.map(w => parseEther('100')), '0xEB5491C015b73C3B86F4B4a7E8982d97eC4628ff', dexSniper);
    await pumpSniper.run();
}

async function main() {
    const sniperKeys = require('src/secrets/besa/end-keys.json') as Keys.WalletKey[];
    await HoldsoMixTrade.mixSwapMultiWallets(sniperKeys.map(k => k.privateKey), 10);
}
sniper().then();