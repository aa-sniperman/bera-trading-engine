import { ethers, Wallet } from "ethers";
import { PumpeTokenCreation } from "./types";
import { MemeFactory__factory } from "src/contracts";
import { MemeSwap } from "./swap";
import { BERAIS_FACTORY, PROVIDER } from "src/constants";
import { sleep } from "src/utils";
import { HoldSoSniper } from "src/holdso/sniper";

export namespace MemeSniper {
    export function extractTokenCreation(log: ethers.Log) {
        const event = MemeFactory__factory.createInterface().parseLog(log);
        if (!event) return;
        if (event.name !== 'MemeCreated') return;
        const creation: PumpeTokenCreation = {
            token: event.args[0],
            pump: event.args[1],
            creator: event.args[2],
            blockNumber: log.blockNumber,
        }
        console.log(creation);
        return creation
    }

    export class Sniper {
        private nonces: number[];
        constructor(
            private readonly wallets: Wallet[],
            private readonly amounts: bigint[],
            private readonly creator: string,
            private readonly dexSniper: HoldSoSniper.Sniper,
            private readonly allocations?: bigint[],
            private latestBlock?: number
        ) {

        }

        async precalculateNonces() {
            this.nonces = await Promise.all(
                this.wallets.map(async (wallet) => {
                    return await wallet.getNonce("pending");
                })
            )
        }

        private async buyForWallet(walletIdx: number, pump: string) {
            let attempt = 0;
            let success = false;
            const wallet = this.wallets[walletIdx];
            const nonce = this.nonces[walletIdx];
            const amount = this.amounts[walletIdx];
            const allocation = this.allocations?.at(walletIdx);
            do {
                try {
                    const hash =
                        allocation ?
                            await MemeSwap.fastBuyWithWhitelist(
                                wallet,
                                nonce,
                                pump,
                                amount,
                                allocation
                            ) :
                            await MemeSwap.fastBuy(
                                wallet,
                                nonce,
                                pump,
                                amount
                            )
                    console.log(hash)
                    success = true;
                } catch (err) {
                    const msg = (err as Error).message;
                    if (msg.includes('nonce has already been used')) {
                        success = true;
                    } else {
                        console.log(`Failed to snipe for wallet ${wallet.address} at attempt ${attempt + 1}`);
                        console.log(err);
                    }
                }
            } while (attempt < 10 && !success);
        }
        async batchBuy(pump: string) {
            await Promise.all(
                this.wallets.map(async (w, i) => {
                    return await this.buyForWallet(i, pump)
                })
            )
        }

        async run() {
            await this.precalculateNonces();

            console.log(this.nonces);

            await this.dexSniper.setup();

            while (true) {
                try {
                    const latest = await PROVIDER.getBlock('latest');

                    console.log(this.latestBlock);
                    const logs = await PROVIDER.getLogs({
                        address: BERAIS_FACTORY,
                        fromBlock: this.latestBlock ?? latest?.number,
                        topics: [
                            ethers.id("MemeCreated(address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,address)"),
                            // ethers.zeroPadValue(this.creator, 32)
                        ]
                    })

                    const creations = logs.map(log => extractTokenCreation(log)).filter(c => c !== undefined && c.creator === this.creator);
                    console.log(creations);
                    if (creations.length > 0) {
                        const creation = creations[0]!;
                        console.log(`Detected new token: ${creation.token}. Sniping.....`)
                        this.batchBuy(creation.pump);

                        // turn on Hold.so sniper
                        await this.dexSniper.run(creation.token, creation.blockNumber);

                        console.log('-------------------------')
                        console.log(creation.token);
                        console.log('-------------------------')
                        return;
                    }

                    if (latest) this.latestBlock = latest.number;

                } catch (err) {
                    console.log(err);
                }

                await sleep(100);
            }
        }
    }
}