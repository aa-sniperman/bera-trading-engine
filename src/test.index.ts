import { Contract, formatEther, parseEther, parseUnits, Wallet } from "ethers";
import { env } from "./configs";
import { BERAIS_FACTORY, HOLD_ADDRESS, NATIVE, NATIVE_WRAPPER, PROVIDER } from "./constants";
import { ERC20__factory, LP__factory, Meme__factory, MemeFactory__factory, NativeWrapper__factory } from "./contracts";
import amounts from "./amounts.json";
import allocations from "./allocations.json";
import snapshot from "./snapshot.json";

import * as fs from 'fs';
import { Keys } from "./keys";
import { getRandomInt, randomArrayWithSum, sleep } from "./utils";
import { MemeLauncher } from "./meme/launcher";
import { Token } from "./token";
import { MemeSwap } from "./meme/swap";
import { MemeSniper } from "./meme/sniper";
import { HoldSoSniper } from "./holdso/sniper";
import { KodiakSwapper } from "./kodiak/swapper";
import { MemeSwapV2 } from "./meme/swap-v2";

const tokenPath = './src/tokens.txt';
const pumpPath = './src/pumps.txt';

const tokens: string[] = fs.readFileSync(tokenPath, 'utf-8').split(/\r?\n/);
const pumps: string[] = fs.readFileSync(pumpPath, 'utf-8').split(/\r?\n/);

const token = HOLD_ADDRESS;
// const amounts = randomArrayWithSum(30, 30 * 1e7, 0.9e7, 1.1e7);

const buyerKeys = require('src/secrets/bb/buyers.json') as Keys.WalletKey[]
const sniperKeys = buyerKeys.slice(0, 5);
const publicSniperKeys = buyerKeys.slice(5, 10);
const dexSniperKeys = buyerKeys.slice(10, 15);
const allKeys = sniperKeys.concat(publicSniperKeys).concat(dexSniperKeys);

async function distribute(token: string, amounts: number[]) {
    const pk = env.keys.pk;

    const wallet = new Wallet(pk, PROVIDER);

    const balances = await Token.getBalances(
        allKeys.map(k => k.address),
        [token, NATIVE],
        ['LP', 'BERA']
    )
    console.log(balances);
    // return;
    const tokenSc = ERC20__factory.connect(token, wallet);
    // const tx = await tokenSc.transfer(lpHolderKeys[i].address, parseUnits(amounts[i].toString(), 18));
    // await tx.wait();
    // console.log(tx.hash);
    // await Token.batchFastTransferToken(
    //     wallet,
    //     token,
    //     allKeys.map(a => parseEther((5000).toString())),
    //     allKeys.map(k => k.address)
    // )
    // await Token.batchFastTransferETH(
    //     wallet,
    //     allKeys.map(a => parseEther('0.01')),
    //     allKeys.map(k => k.address)
    // )
    // for(let i = lpHolderKeys.length - 3; i < lpHolderKeys.length; i++) {
    //     const tx = await wallet.sendTransaction({
    //         to: lpHolderKeys[i].address,
    //         value: parseEther('0.01')
    //     })
    //     await tx.wait();
    //     console.log(tx.hash);
    // }
}


async function checkStakeTVL() {
    const holdPrice = 1.5 // lấy từ api;
    const lpAddress = '0xdcA120bd3A13250B67f6FAA5c29c1F38eC6EBeCE';
    const lp = ERC20__factory.connect(lpAddress, PROVIDER);
    const hold = ERC20__factory.connect(HOLD_ADDRESS, PROVIDER);
    const totalLP = formatEther(await lp.totalSupply());
    const totalHoldReserve = formatEther(await hold.balanceOf(lpAddress))
    const tvl = Number(totalHoldReserve) * 2 * holdPrice;
    console.log(tvl, totalLP, totalHoldReserve)

    const totalStaked = 13000; // lấy từ api
    const totalStakedTVL = tvl * totalStaked / Number(totalLP);
    console.log(totalStakedTVL);

    const vault = '0x927Cc95fBa49E30784DA6F343fCeb77b547488c4';
    const vaultBal = await lp.balanceOf(vault);
    console.log(vaultBal);
}

async function sign() {
    const id =
        Date.now().toString() +
        BigInt('0x' + crypto.randomUUID().replace(/-/g, '')).toString();
    const signData = {
        id,
        pumpAddress: '0x0D8ED695AB53F000041596677C899De62D41b681',
        walletAddress: '0xA8dBa750A2D76586a234efB7bDF1d34fdCc48E14',
        remainingAmountAllocation: parseEther((2.5e6).toString()),
        expiredBlockNumber: 1000000000000
    }
    const signature = await MemeSwap.sign(signData)
    console.log(signData);
    console.log(signature);

}
async function snipe(pump: string) {
    for (let i = 0; i < sniperKeys.length; i++) {
        const key = sniperKeys[i];
        const allocation = parseEther(allocations[i].toString());
        const wallet = new Wallet(key.privateKey, PROVIDER);
        const nonce = await wallet.getNonce();
        MemeSwap.fastBuyWithWhitelist(
            wallet,
            nonce,
            pump,
            allocation
        )
    }
}

async function main() {
    const pk = env.keys.pk;

    const wallet = new Wallet(pk, PROVIDER);

    // return await allocate();

    // return;

    const sum = amounts.reduce((sum, a) => {
        return sum + a
    }, 0)
    console.log(sum)

    // await Promise.all(amounts.map(async (raw, i) => {
    //     await sleep(getRandomInt(0, 20000));
    //     const wallet = new Wallet(lpHolderKeys[i].privateKey, PROVIDER)
    //     const vault = '0xD8d5CC4fDd15448D2037589898c70aaa466F1c7f';
    //     const tokenSc = ERC20__factory.connect(token, wallet);
    //     const amount = parseEther(raw.toString());
    //     const a = await tokenSc.approve(vault, amount);
    //     await a.wait();
    //     console.log(a.hash);
    //     await MemeLauncher.stakeIntoLockVault(wallet, amount, vault);
    // }))

}

async function buy() {
    const pk = env.keys.pk;

    const wallet = new Wallet(pk, PROVIDER);

    await MemeSwap.fastBuy(
        wallet,
        await wallet.getNonce(),
        '0x89FCA4db02D02136D0B374019FD65c578d8C76CA',
        parseEther('5000')
    )
}
async function runAllSnipers(
    pump: string,
    token: string,
    whitelistStartTs: number,
    whitelistEndTs: number
) {
    const whitelistAmounts = sniperKeys.map(k => parseEther((5e6.toString())));
    const publicAmounts = publicSniperKeys.map(k => parseEther('50'));
    const dexAmounts=  dexSniperKeys.map(k => parseEther('50'));
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
    // await wlSniper.run();
    // await publicSniper.run();
    await dexSniper.setup();
    await dexSniper.batchBuy('0x2443c2be245A39bE641F45A701269039363D103E', 3000);
}
async function multisend(){
    const makers = require('src/secrets/bera/vol-keys.json') as Keys.WalletKey[];
    const wallet = new Wallet(makers[0].privateKey, PROVIDER);
    const amounts = [1000n, 1100n, 1200n];
    const recipients = makers.slice(1, 4).map(k => k.address);
    await Token.multiSendBera(wallet, amounts, recipients);
    // await Token.multiSendJSON(wallet, token, snapshot)
}

async function testWhitelist() {
    const pk = env.keys.pk;
    const wallet = new Wallet(pk, PROVIDER);

    const pump = '0x9508D3799e9806134cD519388924de95c2Cedf8c';
    const sc = NativeWrapper__factory.connect(NATIVE_WRAPPER, wallet);
    const data = {
        "id": "1740818207353307793496960024201573624296226493225809",
        "status": "pending",
        "tokenAddress": "0x6c743f633D8232d2e9e07041D78b09F2E2e81d03",
        "walletAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "remainingAmountAllocation": "10000000000000000000000000",
        "expiredBlockNumber": 1821731,
        "signature": "0x0ac2c07ee9d889991c53cf1849ce44ea2095a21af818b1d2c81068628be7819f159bd4628c693235a625d06faa01b144f0072934d051064e2868f9a78b1269e81c",
        "createdTime": 1740818207,
        "tokenAmount": null,
        "created_at": "2025-03-01T01:36:47.388Z",
        "updated_at": "2025-03-01T01:36:47.388Z"
      };
    const amountInMax = parseEther('100');
    const tx = await sc.whitelistBuyExactOut(pump, BigInt(data.remainingAmountAllocation), wallet.address, data.id, data.remainingAmountAllocation, data.expiredBlockNumber, data.signature, {
        value: amountInMax
    });
    await tx.wait();
    console.log(tx.hash);
}

testWhitelist().then();