import { Wallet } from "ethers";
import { HoldsoAggSwapper } from "src/holdso/agg-swapper";
import { Keys } from "src/keys";
import { sleep } from "src/utils";

export namespace BoostHoldersViaSwap {
    export async function boostHoldersViaSwaps(
        wallet: Wallet,
        dstKeys: Keys.WalletKey[],
        from: string,
        to: string,
        dstAmounts: bigint[]
    ) {
        for (let i = 0; i < dstKeys.length; i++) {
            let success = false;

            let attempts = 0

            do {
                try {
                    const hash = await HoldsoAggSwapper.executeSwap({
                        wallet,
                        from,
                        to,
                        amountIn: dstAmounts[i].toString(),
                        slippage: 100,
                        recipient: dstKeys[i].address
                    })
                    console.log(hash);
                    success = true;
                } catch (err) {
                    attempts++;
                    console.log(`Failed, retrying`)
                    await sleep(300);
                }
            } while (!success && attempts < 10);
        }
    }
}