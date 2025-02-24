import axios from "axios";
import accounts from "./address-list.json";
import { TokenConfigInfo } from "src/constants";

const endpoint = 'https://subgraph.hold.so/bera/subgraphs/name/bera/swap';

async function fetchSwapsInRange(account: string, tokenAddress: string, startTime: number, endTime: number) {
    const query = `
    query MyQuery {
      swaps(
        where: {
          origin: "${account.toLowerCase()}",
          token0: "${tokenAddress.toLowerCase()}",
          timestamp_gte: ${startTime},
          timestamp_lt: ${endTime}
        }
      ) {
        amountUSD
        timestamp
        amount0
        amount1
        transaction {
            id
        }
      }
    }
  `;

    try {
        const response = await axios.post(endpoint, { query });
        return response.data.data.swaps || [];
    } catch (error) {
        console.error(`Error fetching swaps from ${startTime} to ${endTime}:`, error);
        return [];
    }
}

export async function fetchAccountSwaps(account: string, tokenAddress: string) {
    const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
    const chunkSize =  6 * 60 * 60; // 1 day per chunk

    let swaps: any[] = [];
    let startTime = now - 16 * 24 * 60 * 60; // 60 days ago
    const seenTransactionIds = new Set<string>();

    while (startTime < now) {
        const endTime = Math.min(startTime + chunkSize, now);
        const chunkSwaps = await fetchSwapsInRange(account, tokenAddress, startTime, endTime);

        for (const swap of chunkSwaps) {
            if (!seenTransactionIds.has(swap.transaction.id)) {
                seenTransactionIds.add(swap.transaction.id);
                swaps.push(swap);
            }
        }

        startTime = endTime;
    }

    // Sort swaps by timestamp (ascending order)
    swaps.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));

    // Aggregate results
    const totalVolumeUSD = swaps.reduce((total, swap) => total + parseFloat(swap.amountUSD), 0);
    const totalVolumeQuoteBuy = swaps.reduce((total, swap) => total + Math.max(0, parseFloat(swap.amount1)), 0);
    const totalVolumeQuoteSell = swaps.reduce((total, swap) => total + Math.max(0, -parseFloat(swap.amount1)), 0);
    const totalVolumeBaseBuy = swaps.reduce((total, swap) => total + Math.max(0, -parseFloat(swap.amount0)), 0);
    const totalVolumeBaseSell = swaps.reduce((total, swap) => total + Math.max(0, parseFloat(swap.amount0)), 0);

    return { account, totalVolumeUSD, totalVolumeQuoteBuy, totalVolumeQuoteSell, totalVolumeBaseBuy, totalVolumeBaseSell, swaps };
}



export async function reportVol(baseAccounts: string[], tokenConfig: TokenConfigInfo) {
    const accountData = await Promise.all(baseAccounts.map(account => fetchAccountSwaps(
        account,
        tokenConfig.address
    )))

    const totalVolumeUSD = accountData.reduce((s, a) => s + a.totalVolumeUSD, 0);
    const totalVolumeQuoteBuy = accountData.reduce((s, a) => s + a.totalVolumeQuoteBuy, 0);
    const totalVolumeQuoteSell = accountData.reduce((s, a) => s + a.totalVolumeQuoteSell, 0);
    const totalVolumeBaseBuy = accountData.reduce((s, a) => s + a.totalVolumeBaseBuy, 0);
    const totalVolumeBaseSell = accountData.reduce((s, a) => s + a.totalVolumeBaseSell, 0);

    const totalFee = (totalVolumeQuoteBuy + totalVolumeQuoteSell) * 0.3 / 99.7;
    const quotePNL = totalVolumeQuoteSell - totalVolumeQuoteBuy;

    return {
        totalVolumeUSD,
        totalVolumeQuoteBuy,
        totalVolumeQuoteSell,
        totalVolumeBaseBuy,
        totalVolumeBaseSell,
        totalFee,
        quotePNL
    }
}

export async function reportClusterSwaps(tokenConfig: TokenConfigInfo) {
    // @ts-ignore
    const baseAccounts: string[] = accounts[tokenConfig.symbol.toLowerCase()];
    const accountData = await Promise.all(baseAccounts.map(account => fetchAccountSwaps(
        account,
        tokenConfig.address
    )))
    const totalVolumeUSD = accountData.reduce((s, a) => s + a.totalVolumeUSD, 0);
    const totalVolumeQuoteBuy = accountData.reduce((s, a) => s + a.totalVolumeQuoteBuy, 0);
    const totalVolumeQuoteSell = accountData.reduce((s, a) => s + a.totalVolumeQuoteSell, 0);
    const totalVolumeBaseBuy = accountData.reduce((s, a) => s + a.totalVolumeBaseBuy, 0);
    const totalVolumeBaseSell = accountData.reduce((s, a) => s + a.totalVolumeBaseSell, 0);
    const totalFee = (totalVolumeQuoteBuy + totalVolumeQuoteSell) * 0.3 / 100;

    return {
        totalVolumeUSD,
        totalVolumeQuoteBuy,
        totalVolumeQuoteSell,
        totalVolumeBaseBuy,
        totalVolumeBaseSell,
        totalFee
    }
}