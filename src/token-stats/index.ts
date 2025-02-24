import axios from "axios";
import { env } from "src/configs";
import { NATIVE, PROVIDER, TokenConfigInfo } from "src/constants";
import { Keys } from "src/keys";
import { Token } from "src/token";
import { sleep } from "src/utils";

export namespace TokenStats {
    export async function extractERC20Transfers({
        token,
        address,
    }: {
        token: string,
        address: string,
    }) {
        const apiKey = env.bera.apiKey;

        const endBlock = (await PROVIDER.getBlock('latest'))?.number!;
        const sort = 'desc';
        const baseUrl = 'https://api.berascan.com/api';

        while(true) {
        const params = {
            module: 'account',
            action: 'tokentx',
            contractaddress: token,
            address,
            page: 1,
            offset: 0,
            startblock: 0,
            endblock: endBlock,
            sort,
            apikey: apiKey,
        };

        try {
            const response = await axios.get(baseUrl, { params });
            return response.data.result as any[];
        } catch (error) {
            console.error('Error fetching token transactions:', (error as Error).message);
            return [];
        }
    }
    }
    export async function reportBalances(config: TokenConfigInfo) {
        const makerSets = Keys.getVolKeys(config);

        let totalberachain = 0;
        let totalBase = 0;

        for (let i = 0; i < makerSets.length; i++) {
            console.log('Set: ' + i);
            const balances = await Token.getBalances(
                makerSets[i].map(k => k.address),
                [NATIVE, config.address],
                ['berachain', config.symbol]
            )
            console.log(balances);
            totalberachain += Number(balances['total']['berachain']);
            totalBase += Number(balances['total'][config.symbol]);
        }

        console.log(totalberachain, totalBase)
    }

    export async function get24hVolume(pair: string) {
        let attempt = 0
        const maxAttempt = 5
        while (attempt <= maxAttempt) {
            try {
                const apiEndpoint = `https://api.dexscreener.com/latest/dex/pairs/berachain/${pair}`
                const response = await axios.get(apiEndpoint);
                console.log(response.data.pairs[0].volume.h24);
                return response.data.pairs[0].volume.h24;
            }
            catch (e) {
                await sleep(5000)
                attempt += 1
            }
        }
    }

    export async function get1hVolume(pair: string) {
        let attempt = 0
        const maxAttempt = 5
        while (attempt <= maxAttempt) {
            try {
                const apiEndpoint = `https://api.dexscreener.com/latest/dex/pairs/berachain/${pair}`
                const response = await axios.get(apiEndpoint);
                console.log(response.data.pairs[0].volume.h1);
                return response.data.pairs[0].volume.h1;
            }
            catch (e) {
                await sleep(5000)
                attempt += 1
            }
        }
    }

    export async function getTokenPrice(pair: string) {
        let attempt = 0
        const maxAttempt = 5
        while (attempt <= maxAttempt) {
            try {
                const apiEndpoint = `https://api.dexscreener.com/latest/dex/pairs/berachain/${pair}`
                const response = await axios.get(apiEndpoint);
                return Number(response.data.pairs[0].priceUsd);
            }
            catch (e) {
                await sleep(5000)
                attempt += 1
            }
        }
    }

    export async function getOverallMarketData(pair: string) {
        let attempt = 0
        const maxAttempt = 5
        while (attempt <= maxAttempt) {
            try {
                const apiEndpoint = `https://api.dexscreener.com/latest/dex/pairs/berachain/${pair}`
                const response = await axios.get(apiEndpoint);
                const price = Number(response.data.pairs[0].priceUsd);
                const vol1h = Number(response.data.pairs[0].volume.h1);
                const vol24h = Number(response.data.pairs[0].volume.h24);
                const mc = Number(response.data.pairs[0].marketCap);

                return {price, vol1h, vol24h, mc};
            }
            catch (e) {
                await sleep(5000)
                attempt += 1
            }
        }
    }
}