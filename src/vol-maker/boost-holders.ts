import { Wallet } from "ethers";
import { HoldsoAggSwapper } from "src/holdso/agg-swapper";
import { Keys } from "src/keys";

export namespace BoostHoldersViaSwap {
    export async function boostHoldersViaSwaps(
        wallet: Wallet,
        dstKeys: Keys.WalletKey[],
        from: string,
        to: string,
        dstAmounts: bigint[]
    ) {
        for (let i = 0; i < dstKeys.length; i++) {
            const hash = await HoldsoAggSwapper.executeSwap({
                wallet,
                from,
                to,
                amountIn: dstAmounts[i].toString(),
                slippage: 5
            })
            console.log(hash);
        }
    }
}