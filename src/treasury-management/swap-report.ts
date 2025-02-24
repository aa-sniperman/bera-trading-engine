import axios from "axios";
import accounts from "./address-list.json";
import { TokenConfigInfo } from "src/constants";

export async function fetchAccountSwaps(
    account: string,
    tokenAddress: string
) {
    const endpoint = 'https://subgraph.hold.so/bera/subgraphs/name/bera/swap';
    const query = `
    query MyQuery {
      swaps(
        where: {
          origin: "${account.toLowerCase()}",
          token0: "${tokenAddress.toLowerCase()}"
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
        const swaps = response.data.data.swaps;

        // Calculate total volume for this recipient
        const totalVolumeUSD = swaps.reduce((total: number, swap: any) => {
            return total + parseFloat(swap.amountUSD);
        }, 0);

        const totalVolumeQuoteBuy = swaps.reduce((total: number, swap: any) => {
            const amount = parseFloat(swap.amount1);
            return total + (amount > 0 ? amount : 0);
        }, 0);

        const totalVolumeQuoteSell = swaps.reduce((total: number, swap: any) => {
            const amount = parseFloat(swap.amount1);
            return total + (amount < 0 ? -amount : 0);
        }, 0);

        const totalVolumeBaseBuy = swaps.reduce((total: number, swap: any) => {
            const amount = parseFloat(swap.amount0);
            return total + (amount < 0 ? -amount : 0);
        }, 0);

        const totalVolumeBaseSell = swaps.reduce((total: number, swap: any) => {
            const amount = parseFloat(swap.amount0);
            return total + (amount > 0 ? amount : 0);
        }, 0);

        return { account, totalVolumeUSD, totalVolumeQuoteBuy, totalVolumeQuoteSell, totalVolumeBaseBuy, totalVolumeBaseSell };
    } catch (error) {
        console.error(`Error querying for recipient ${account}:`, error);
        return {
            account, totalVolumeUSD: 0, totalVolumeQuoteBuy: 0, totalVolumeQuoteSell: 0,
            totalVolumeBaseBuy: 0, totalVolumeBaseSell: 0,
            error: (error as Error).message
        };
    }
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