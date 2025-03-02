import { Wallet } from "ethers";
import { KODIAK_ROUTER, KODIAK_ROUTER_V2 } from "src/constants";
import { KodiakRouter02__factory, UniswapV2Router__factory } from "src/contracts";
import { Token } from "src/token";

export namespace KodiakSwapper {
    export async function executeSwap(
        wallet: Wallet,
        tokenIn: string,
        tokenOut: string,
        amountIn: bigint,
        recipient?: string
    ) {
        await Token.approveIfNeeded(wallet, KODIAK_ROUTER, tokenIn, amountIn);
        const sc = UniswapV2Router__factory.connect(KODIAK_ROUTER, wallet);
        const tx = await sc.swapExactTokensForTokens(
            amountIn,
            0n,
            [
                tokenIn,
                tokenOut
            ],
            recipient ?? wallet.address
        );
        await tx.wait();
        return tx.hash;
    }
    export async function executeSwapV2(
        wallet: Wallet,
        tokenIn: string,
        tokenOut: string,
        amountIn: bigint,
        recipient?: string
    ) {
        await Token.approveIfNeeded(wallet, KODIAK_ROUTER_V2, tokenIn, amountIn);
        const sc = KodiakRouter02__factory.connect(KODIAK_ROUTER_V2, wallet);
        const tx = await sc.swapExactTokensForTokens(
            amountIn,
            0n,
            [
                tokenIn,
                tokenOut
            ],
            recipient ?? wallet.address,
            Date.now() + 1000000
        );
        await tx.wait();
        return tx.hash;
    }
}