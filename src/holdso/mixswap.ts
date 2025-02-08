import { getAddress, Wallet } from "ethers";
import { HOLD_ADDRESS, PROVIDER } from "src/constants";
import { Token } from "src/token";
import { getRandomInt, sleep } from "src/utils";
import tokensForTrade from "./tokens-for-mix-trade.json";
import { env } from "src/configs";
import { HoldsoSwap } from "./swapper";

export namespace HoldsoMixTrade {
    export async function mixSwapOneWallet(privKey: string, baseTokens: string[], rounds: number) {
        const wallet = new Wallet(privKey, PROVIDER);
        for (let i = 0; i < rounds; i++) {
            const tokenIdx = getRandomInt(0, baseTokens.length);
            const baseToken = baseTokens[tokenIdx];
            console.log(`Mix swap for wallet: ${wallet.address}, round: ${i}, chosen token: ${baseToken}...`);
            let attempts = 0;
            let success = false;
            do {
                try {

                    const quoteBalance = await Token.getTokenBalance(wallet.address, HOLD_ADDRESS);
                    const buyAmountPercent = getRandomInt(5, 7);
                    const buyAmount = quoteBalance * BigInt(buyAmountPercent) / 1000n;

                    console.log(`Buying with ${buyAmount}.....`);
                    const buyHash = await HoldsoSwap.executeSwap(wallet.privateKey, {
                        tokenIn: HOLD_ADDRESS,
                        tokenOut: baseToken,
                        fee: 3000,
                        recipient: wallet.address,
                        amountIn: buyAmount,
                        amountOutMinimum: 0,
                        sqrtPriceLimitX96: 0,
                        deadline: Date.now() + 60000,
                    });
                    console.log(`Buy tx hash: ` + buyHash);
                    await sleep(getRandomInt(5000, 7000));


                    const baseBalance = await Token.getTokenBalance(wallet.address, baseToken);
                    console.log(`Selling all....`)
                    const sellAmount = baseBalance * 995n / 1000n;
                    const sellHash = await HoldsoSwap.executeSwap(wallet.privateKey, {
                        tokenIn: baseToken,
                        tokenOut: HOLD_ADDRESS,
                        fee: 3000,
                        recipient: wallet.address,
                        amountIn: sellAmount,
                        amountOutMinimum: 0,
                        sqrtPriceLimitX96: 0,
                        deadline: Date.now() + 60000,
                    });
                    console.log(`Sell tx hash: ` + sellHash);
                    success = true;
                } catch (err) {
                    console.log(err);
                }

                await sleep(getRandomInt(2000, 3000));
            } while (attempts < 3 && !success);
        }
    }

    export async function mixSwapMultiWallets(
        privKeys: string[],
        rounds: number
    ) {
        const baseTokens = (env.network === 'mainnet' ? tokensForTrade.mainnet : tokensForTrade.testnet)
            .map((t: any) => getAddress(t))
        await Promise.all(privKeys.map(pk =>
            mixSwapOneWallet(pk, baseTokens, rounds)
        ))
    }
}