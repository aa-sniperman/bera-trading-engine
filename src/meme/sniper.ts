import { ethers, parseEther, Wallet } from "ethers";
import { PumpeTokenCreation } from "./types";
import { MemeFactory__factory } from "src/contracts";
import { MemeSwap } from "./swap";
import { BERAIS_FACTORY, HOLD_ADDRESS, PROVIDER } from "src/constants";
import { getRandomInt, sleep } from "src/utils";
import { HoldSoSniper } from "src/holdso/sniper";
import { Token } from "src/token";

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
            do {
                try {
                    const hash =
                        
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
                        await this.dexSniper.run(creation.pump, creation.token, creation.blockNumber);

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

    export class WhitelistSniper {
        private signedTxs: string[];

        constructor(
            private readonly wallets: Wallet[],
            private readonly pump: string,
            private readonly allocations: bigint[],
            private readonly whitelistStartTs: number
        ) {

        }

        async prepare() {
            const nonces = await Promise.all(
                this.wallets.map(async (wallet) => {
                    return await wallet.getNonce("pending");
                })
            );
            this.signedTxs = [];
            for (let i = 0; i < this.wallets.length; i++) {
                const wallet = this.wallets[i];
                const nonce = nonces[i];
                const allocation = this.allocations[i];
                const signedTx = await MemeSwap.prepareForWhitelistBuy(wallet, nonce, this.pump, allocation);
                this.signedTxs.push(signedTx);
            }
        }

        async preApprove() {
            await Promise.all(this.wallets.map(async (w) => {
                await sleep(getRandomInt(5000, 10000));
                await Token.approveIfNeeded(
                    w,
                    this.pump,
                    HOLD_ADDRESS,
                    parseEther('5000')
                )
            }))
        }

        async batchBuy() {
            await Promise.all(this.signedTxs.map(async (tx) => {
                const res = await PROVIDER.broadcastTransaction(tx);
                console.log(res.hash)
            }))
        }

        async run() {
            await this.preApprove();
            await this.prepare();

            while (true) {
                const block = await PROVIDER.getBlock('latest');
                const ts = block!.timestamp;
                console.log('wl ts: ', ts, this.whitelistStartTs)
                if (ts >= this.whitelistStartTs) {
                    console.log(`Whitelist rounds started!. Sniping...`)
                    await this.batchBuy();
                    return;
                }
            }
        }
    }

    export class PublicSniper {
        private signedTxs: string[] = [];

        constructor(
            private readonly wallets: Wallet[],
            private readonly pump: string,
            private readonly token: string,
            private readonly amountIn: bigint[],
            private readonly whitelistEndTs: number,
            private readonly dexSniper: HoldSoSniper.Sniper
        ) {

        }

        async prepare() {
            const nonces = await Promise.all(
                this.wallets.map(async (wallet) => {
                    return await wallet.getNonce("pending");
                })
            );
            for (let i = 0; i < this.wallets.length; i++) {
                const wallet = this.wallets[i];
                const nonce = nonces[i];
                const amount = this.amountIn[i];
                const signedTx = await MemeSwap.prepareForBuy(wallet, nonce, this.pump, amount);
                this.signedTxs.push(signedTx);
            }
        }

        async preApprove() {
            await Promise.all(this.wallets.map(async (w, i) => {
                await sleep(getRandomInt(5000, 10000));
                await Token.approveIfNeeded(
                    w,
                    this.pump,
                    HOLD_ADDRESS,
                    this.amountIn[i]
                )
            }))
        }

        async batchBuy() {
            await Promise.all(this.signedTxs.map(async (tx) => {
                const res = await PROVIDER.broadcastTransaction(tx);
                console.log(res.hash)
            }))
        }

        async run() {
            await this.preApprove();
            await this.prepare();
            await this.dexSniper.setup();

            while (true) {
                const block = await PROVIDER.getBlock('latest');
                const ts = block!.timestamp;
                console.log('pl ts: ', ts, this.whitelistEndTs)
                if (ts >= this.whitelistEndTs) {
                    console.log(`Whitelist round ended!. Sniping...`)
                    await this.batchBuy();
                    await this.dexSniper.run(this.pump, this.token, block!.number);
                    return;
                }
            }
        }
    }
}