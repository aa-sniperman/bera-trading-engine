import axios from "axios";

export async function queryUserTrades(token0: string, token1: string, minAmountUsd: number, timestampGt?: number) {
    const endpoint = 'https://subgraph.hold.so/subgraphs/name/holdstation/swap';

    const query = `
query MyQuery {
  swaps(
    orderBy: timestamp
    orderDirection: desc
    where: {token0: ${token0.toLowerCase()}, token1: ${token1.toLowerCase()}, amountUSD_gte: "${minAmountUsd}", timestamp_gt: "${timestampGt}"}
  ) {
    amount0
    amount1
    amountUSD
    timestamp
  }
}
            `;

    try {
        const response = await axios.post(endpoint, { query });
        const swaps = response.data.data.swaps;

        return swaps.map((swap: any) => {
            return {
                amount0: Number(swap.amount0),
                amount1: Number(swap.amount1),
                amountUSD: Number(swap.amountUSD),
                timestamp: Number(swap.timestamp)
            }
        })

    } catch (error) {
        console.error(`Error querying trades:`, error);
        return []
    }

}