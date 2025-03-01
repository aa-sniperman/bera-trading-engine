import { createObjectCsvWriter } from 'csv-writer';
import { HOLD_ADDRESS, HOLDSO_AGG_ADDRESS, NATIVE, TokenConfig, WRAPPED_NATIVE } from './constants';
import { reportSupply } from './treasury-management/supply-report';
import { fetchAccountSwaps, reportClusterSwaps, reportVol } from './treasury-management/swap-report';
import { sleep } from './utils';
import inventory from "./treasury-management/address-list.json";
import { Token } from './token';
import { Keys } from './keys';
import { fetchAccountSwapTransfers, reportClusterSwapTransfers, reportClusterTransfers } from './treasury-management/transfer-report';
import { HoldsoSwap } from './holdso/swapper';
import { formatEther, parseEther } from 'ethers';
import { writeFileSync } from 'fs';

async function reportAll() {
    const data: { [key: string]: any } = {};
    const configs = [
        TokenConfig.ATI,
        // TokenConfig.BB,
        // TokenConfig.BR,
        // TokenConfig.THOON
    ]
    for (const config of configs) {
        const supplyInfo = await reportSupply(config);
        console.log(supplyInfo);
        const swapInfo = await reportClusterSwaps(config);
        console.log(config.symbol, swapInfo);
        data[config.symbol] = {
            symbol: config.symbol,
            ...supplyInfo,
            ...swapInfo,
        }
        await sleep(10000);
    }
    // Prepare headers for CSV dynamically
    const sampleData = Object.values(data)[0]; // Get fields from the first entry
    const headers = Object.keys(sampleData).map((key) => ({
        id: key,
        title: key,
    }));

    // Create the CSV writer
    const csvWriter = createObjectCsvWriter({
        path: 'output.csv', // Output file path
        header: headers, // Include headers dynamically
    });

    // Prepare data for CSV
    const records = Object.values(data); // Flatten data into an array of row objects

    // Write data to the CSV file
    await csvWriter.writeRecords(records);

    console.log('CSV file has been written successfully.');
}

async function balances() {
    const volKeys = require('src/secrets/bera/vol-keys.json') as Keys.WalletKey[];
    const middleKeys = require('src/secrets/bera/middle-keys.json') as Keys.WalletKey[];
    const balances = await Token.getBalances(volKeys.concat(middleKeys).map(k => k.address), [WRAPPED_NATIVE], ['BERA']);
    console.log(balances);
}

async function sellAll() {
    const volKeys = require('src/secrets/bera/vol-keys.json') as Keys.WalletKey[];
    const balances = await Token.getRawBalances(volKeys.map(k => k.address), Object.values(TokenConfig).map(v => v.address));
    for (const config of Object.values(TokenConfig)) {
        await Promise.all(volKeys.map(async (key) => {
            try {
                await HoldsoSwap.executeSwap(
                    key.privateKey,
                    {
                        tokenIn: config.address,
                        tokenOut: HOLD_ADDRESS,
                        fee: 3000,
                        recipient: key.address,
                        deadline: Date.now() + 60000,
                        amountIn: balances[key.address][config.address],
                        amountOutMinimum: 0n,
                        sqrtPriceLimitX96: 0n
                    }
                )
            } catch (err) {

            }
        }))
    }
}

async function vol() {
    const volKeys = require('src/secrets/bera/vol-keys.json') as Keys.WalletKey[];
    const middleKeys = require('src/secrets/bera/middle-keys.json') as Keys.WalletKey[];
    const allKeys = volKeys.concat(middleKeys);
    let quotePNL = 0;
    let totalFee = 0;
    for (const config of Object.values(TokenConfig)) {
        const vol = await reportVol(allKeys.map(k => k.address), config);
        console.log(vol);
        quotePNL += vol.quotePNL;
        totalFee += vol.totalFee;
    }
    console.log(quotePNL, totalFee);
}

async function transfer() {
    const volKeys = require('src/secrets/bera/vol-keys.json') as Keys.WalletKey[];
    const middleKeys = require('src/secrets/bera/middle-keys.json') as Keys.WalletKey[];
    const allKeys = volKeys.concat(middleKeys);
    const data = await reportClusterSwapTransfers(
        HOLD_ADDRESS,
        allKeys.map(k => k.address),
        Object.values(TokenConfig).map(k => k.pair).concat(HOLDSO_AGG_ADDRESS)
    );
    console.log(data);
}

async function audit() {
    const account = '0xBeC3A8EefA0255F1A2619C2F7fb43624Ba292AdA';
    const beraSwaps = await fetchAccountSwaps(account, TokenConfig.BERA.address);
    const swapTxHashes = beraSwaps.swaps
        .sort((a: any, b: any) => Number(a.timestamp) - Number(b.timestamp))
        .map((s: any) => s.transaction.id);

    const { transfers, receipts } = await fetchAccountSwapTransfers(account, TokenConfig.BERA.address, [TokenConfig.BERA.pair, HOLDSO_AGG_ADDRESS]);
    const transferTxHashes = transfers
        .sort((a: any, b: any) => Number(a.timeStamp) - Number(b.timeStamp))
        .map((t: any) => t.hash);

    const receiptTxHashes = receipts.map((r: any) => r.hash);

    const totalBuy = beraSwaps.swaps.reduce((sum, s: any) => sum + Math.max(0, Number(s.amount1)), 0);
    const totalSell = beraSwaps.swaps.reduce((sum, s: any) => sum - Math.min(0, Number(s.amount1)), 0);
    const totalTransfer = transfers.reduce((sum, s: any) => sum + Number(formatEther(s.value)), 0);
    const totalReceipt = receipts.reduce((sum, s: any) => sum + Number(formatEther(s.value)), 0);

    console.log(totalBuy, totalSell, totalTransfer, totalReceipt);
}

vol().then();