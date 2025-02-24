import { Wallet } from "ethers";
import { Token } from "../token";
import { HoldsoSwap } from "src/holdso/swapper";
import { ISwapRouter } from "src/contracts/HoldsoRouter";
import { getRandomInt } from "src/utils";
import { MAX_UINT256, TokenConfigInfo } from "src/constants";

export class MMWalletsManager {
    balances: Record<string, Record<string, bigint>>;

    private addressToWallet: Record<string, Wallet> = {};
    constructor(
        public readonly wallets: Wallet[],
        public readonly quoteConfig: TokenConfigInfo,
        public readonly baseConfig: TokenConfigInfo
    ) {
        wallets.forEach(w => {
            this.addressToWallet[w.address] = w;
        })
    }

    get totalBaseBalance() {
        return this.balances['total'][this.baseConfig.address];
    }

    get totalQuoteBalance() {
        return this.balances['total'][this.quoteConfig.address];
    }

    async setup() {
        await Promise.all(this.wallets.map(k => HoldsoSwap.approveTokenIfNeeded(k.privateKey, this.quoteConfig.address, BigInt(MAX_UINT256))));

        await Promise.all(this.wallets.map(k => HoldsoSwap.approveTokenIfNeeded(k.privateKey, this.baseConfig.address, BigInt(MAX_UINT256))));
    }

    async syncBalances() {
        this.balances = await Token.getRawBalances(this.wallets.map(w => w.address), [
            this.quoteConfig.address,
            this.baseConfig.address
        ])
    }

    private async executeSwapForAWallet(
        wallet: Wallet,
        tokenIn: string,
        tokenOut: string,
        amountIn: bigint
    ) {
        let success = false;
        let attempts = 0;

        while (!success && attempts < 10) {
            try {
                const params: ISwapRouter.ExactInputSingleParamsStruct = {
                    tokenIn,
                    tokenOut,
                    fee: 3000,
                    recipient: wallet.address,
                    amountIn,
                    amountOutMinimum: 0,
                    sqrtPriceLimitX96: 0,
                    deadline: Date.now() + 60000
                }
                const hash = await HoldsoSwap.executeSwap(
                    wallet.privateKey,
                    params
                )
                console.log(hash);
                success = true;
            } catch (err) {
                attempts++;
            }
        }
    }

    calculateInputsForSwap(
        token: string,
        amountIn: bigint,
    ): Record<string, bigint> {

        if (this.balances['total'][token] * 95n / 100n < amountIn) {
            throw new Error('Insufficient balance');
        }
        // Filter wallets that have sufficient balance for the chosen token
        const eligibleWallets = this.wallets.filter(wallet => {
            const walletBalances = this.balances[wallet.address];
            return walletBalances && walletBalances[token] && walletBalances[token] >= 0n;
        });

        if (eligibleWallets.length === 0) {
            throw new Error("No wallets have sufficient balance for the swap.");
        }
        let remainingAmount = amountIn;
        const allocations: Record<string, bigint> = {};
        const available: Record<string, bigint> = {};
        this.wallets.forEach(w => {
            available[w.address] = this.balances[w.address][token];
        })

        // Shuffle wallets randomly to pick wallets in random order
        const shuffledWallets = eligibleWallets.sort(() => Math.random() - 0.5);

        while (remainingAmount > 0n) {
            for (const wallet of shuffledWallets) {
                if (remainingAmount <= 0n) break;

                // Generate a random percentage (5% to 55%) of the wallet's balance
                const maxTakeable = available[wallet.address] * BigInt(getRandomInt(5, 55)) / 100n;

                // Allocate the minimum of the remaining amount or the random percentage
                const allocation = maxTakeable > remainingAmount ? remainingAmount : maxTakeable;

                if (allocation > 0n) {
                    allocations[wallet.address] = (allocations[wallet.address] || 0n) + allocation;
                    available[wallet.address] -= allocation;
                    remainingAmount -= allocation;
                }
            }
        }

        return allocations;

    }

    async executeSwap(
        quoteForBase: boolean,
        amountIn: bigint,
    ) {
        const tokenIn = quoteForBase ? this.quoteConfig.address : this.baseConfig.address;
        const tokenOut = quoteForBase ? this.baseConfig.address : this.quoteConfig.address;
        const allocations = this.calculateInputsForSwap(tokenIn, amountIn);
        console.log(allocations);
        await Promise.all(Object.entries(allocations).map(async ([address, amount]) => {
            await this.executeSwapForAWallet(
                this.addressToWallet[address],
                tokenIn,
                tokenOut,
                amount
            )
        }))
    }
}
