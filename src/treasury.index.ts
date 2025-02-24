import { createObjectCsvWriter } from 'csv-writer';
import { HOLD_ADDRESS, NATIVE, TokenConfig, WRAPPED_NATIVE } from './constants';
import { reportSupply } from './treasury-management/supply-report';
import { reportClusterSwaps, reportVol } from './treasury-management/swap-report';
import { sleep } from './utils';
import inventory from "./treasury-management/address-list.json";
import { Token } from './token';
import { Keys } from './keys';
import { reportClusterSwapTransfers, reportClusterTransfers } from './treasury-management/transfer-report';

async function reportAll() {
    const data: { [key: string]: any } = {};
    const configs = [
        TokenConfig.ATI
    ]
    for (const config of configs) {
        const supplyInfo = await reportSupply(config);
        console.log(supplyInfo);
        const swapInfo = await reportClusterSwaps(config);
        console.log(swapInfo);
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
        volKeys.slice(0, 100).map(k => k.address),
        [TokenConfig.THOON.pair]
    );
    console.log(data);
}

transfer().then();