import { ethers, Wallet } from "ethers";
import { HoldSoListing } from "./types";
import { BERAIS_FACTORY, HOLD_ADDRESS, PROVIDER } from "src/constants";
import { HoldsoSwap } from "./swapper";
import { ISwapRouter } from "src/contracts/HoldsoRouter";
import { sleep } from "src/utils";
import { Meme__factory } from "src/contracts";

const agentFiInterface = Meme__factory.createInterface();

export namespace HoldSoSniper {
    export function extractPairCreated(log: ethers.Log) {
        const event = agentFiInterface.parseLog(log);
        if (!event) return;
        if (event.name !== 'List(uint256,uint256,address,address)') return;
        const creation: HoldSoListing = {
            token: event.args[0],
            pool: event.args[1],
        }
        return creation;
    }
    export class Sniper {
        private latestBlock: number;
        private nonces: number[];
        private wallets: Wallet[];
        constructor(
            private readonly privKeys: string[],
            private readonly amounts: bigint[],
            private readonly feeTier: number = 3000,
        ) {
            this.wallets = privKeys.map(p => new Wallet(p, PROVIDER));
        }

        private async preApprove() {
            const approvals = []
            for (let i = 0; i < this.privKeys.length; i++) {
                const privKey = this.privKeys[i];
                const amount = this.amounts[i];
                approvals.push(HoldsoSwap.approveTokenIfNeeded(privKey, HOLD_ADDRESS, amount));
            }
            await Promise.all(approvals);
        }

        private async precalculateNonces() {
            this.nonces = await Promise.all(
                this.wallets.map(async (wallet) => {
                    return await wallet.getNonce("pending");
                })
            )
        }

        private async buyForWallet(walletIdx: number, token: string, feeTier: number) {
            let attempt = 0;
            let success = false;
            const wallet = this.wallets[walletIdx];
            const nonce = this.nonces[walletIdx];
            const amount = this.amounts[walletIdx];
            do {
                try {
                    const params: ISwapRouter.ExactInputSingleParamsStruct = {
                        tokenIn: HOLD_ADDRESS,
                        tokenOut: token,
                        fee: feeTier,
                        recipient: wallet.address,
                        amountIn: amount,
                        amountOutMinimum: 0,
                        sqrtPriceLimitX96: 0,
                        deadline: Date.now() + 60000
                    }
                    const hash = await HoldsoSwap.fastSwap(
                        wallet,
                        nonce,
                        params
                    )
                    console.log(hash)
                    success = true;
                } catch (err) {
                    console.log(err);
                    console.log(`Failed to snipe for wallet ${wallet.address} at attempt ${attempt + 1}`);
                }
            } while (attempt < 10 && !success);
        }
        async batchBuy(token: string, feeTier: number) {
            await Promise.all(
                this.privKeys.map(async (pk, i) => {
                    return await this.buyForWallet(i, token, feeTier)
                })
            )
        }

        async setup() {
            await this.preApprove();
            await this.precalculateNonces();
        }
        async run(token: string, fromBlock: number, feeTier = 3000) {
            this.latestBlock = fromBlock;
            while (true) {
                try {

                    console.log(this.latestBlock);
                    const logs = await PROVIDER.getLogs({
                        fromBlock: this.latestBlock,
                        toBlock: this.latestBlock + 999,
                        // fromBlock: 51587325,
                        // toBlock: 51587340,
                        topics: [
                            ethers.id("List(uint256,uint256,address,address)"),
                            ethers.zeroPadValue(BERAIS_FACTORY, 32),
                        ]
                    })

                    console.log(logs);
                    const creations = logs.map(log => extractPairCreated(log)).filter(c => c !== undefined);
                    console.log(creations);
                    for (const creation of creations) {
                        if (creation.token === token) {
                            console.log(`Detected new pool: ${creation.pool}. Sniping.....`)
                            await this.batchBuy(token, feeTier);
                            return;
                        }
                    }

                    const latest = await PROVIDER.getBlock('latest');
                    if (latest) this.latestBlock = Math.min(latest.number, this.latestBlock + 1000);

                } catch (err) {
                    console.log(err);
                }

                await sleep(100);
            }
        }
    }
}