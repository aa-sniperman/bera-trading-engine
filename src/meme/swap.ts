import { ethers, getAddress, parseEther, solidityPackedKeccak256, TransactionRequest, Wallet } from "ethers";
import { env } from "src/configs";
import { CHAIN_ID, HOLD_ADDRESS, BERAIS_FACTORY, PROVIDER } from "src/constants";
import { ERC20__factory, Meme__factory, MemeFactory__factory, MemeFactoryTestnet__factory } from "src/contracts";
import { Token } from "src/token";

export namespace MemeSwap {

    export async function sign(body: {
        id: string,
        pumpAddress: string,
        walletAddress: string,
        remainingAmountAllocation: BigInt,
        expiredBlockNumber: number
    }) {
        const {
            id,
            pumpAddress,
            walletAddress,
            remainingAmountAllocation,
            expiredBlockNumber,
        } = body;
        const adminWallet = new Wallet(env.keys.signerKey);
        const msgHash = solidityPackedKeccak256(
            ['uint256', 'address', 'address', 'uint256', 'uint256'],
            [
                id,
                getAddress(pumpAddress),
                getAddress(walletAddress),
                remainingAmountAllocation,
                expiredBlockNumber,
            ],
        );

        const signature = await adminWallet.signMessage(ethers.getBytes(msgHash));
        return signature;
    }

    export async function getPumpTest(tokenId: string) {
        const factory = MemeFactoryTestnet__factory.connect(BERAIS_FACTORY, PROVIDER);
        const pump = await factory.getPumpContractAddress(tokenId);

        return pump;
    }
    export async function getPump(token: string) {
        const factory = MemeFactory__factory.connect(BERAIS_FACTORY, PROVIDER);
        const pump = await factory.getPumpContractAddress(token);

        return pump;
    }
    export async function buy(
        wallet: Wallet,
        pump: string,
        amountIn: bigint,
        recipient?: string
    ) {
        await Token.approveIfNeeded(wallet, pump, HOLD_ADDRESS, amountIn);


        const sc = Meme__factory.connect(pump, wallet);
        const tx = await sc.swapExactIn(amountIn, 0n, true, recipient ?? wallet.address)
        await tx.wait();
        return tx.hash;
    }

    export async function sell(
        wallet: Wallet,
        token: string,
        pump: string,
        amountIn: bigint,
        recipient?: string
    ) {
        await Token.approveIfNeeded(wallet, pump, token, amountIn);
        const sc = Meme__factory.connect(pump, wallet);
        const tx = await sc.swapExactIn(amountIn, 0n, false, recipient ?? wallet.address);
        await tx.wait();
        return tx.hash;
    }

    export async function fastBuyWithoutApproval(
        wallet: Wallet,
        nonce: number,
        pump: string,
        amountIn: bigint,
    ) {
        const data = Meme__factory.createInterface().encodeFunctionData(
            "swapExactIn",
            [
                amountIn,
                0n,
                true,
                wallet.address
            ]
        );
        const tx: TransactionRequest = {
            from: wallet.address,
            to: pump,
            gasLimit: 1_000_000n,
            gasPrice: 100_000_000n,
            data,
            nonce,
            type: 0,
            chainId: BigInt(CHAIN_ID)
        }
        const signedTx = await wallet.signTransaction(tx);
        const receipt = await wallet.provider!.broadcastTransaction(signedTx);
        return receipt.hash;
    }
    export async function fastBuy(
        wallet: Wallet,
        nonce: number,
        pump: string,
        amountIn: bigint,
    ) {
        const approvalData = ERC20__factory.createInterface().encodeFunctionData(
            "approve",
            [
                pump,
                amountIn
            ]
        )
        const approvalTx: TransactionRequest = {
            from: wallet.address,
            to: HOLD_ADDRESS,
            gasLimit: 1_000_000n,
            gasPrice: 100_000_000n,
            data: approvalData,
            nonce: nonce++,
            type: 0,
            chainId: BigInt(CHAIN_ID)
        }
        const data = Meme__factory.createInterface().encodeFunctionData(
            "swapExactIn",
            [
                amountIn,
                0n,
                true,
                wallet.address
            ]
        );
        const tx: TransactionRequest = {
            from: wallet.address,
            to: pump,
            gasLimit: 1_000_000n,
            gasPrice: 100_000_000n,
            data,
            nonce,
            type: 0,
            chainId: BigInt(CHAIN_ID)
        }
        const signedApprovalTx = await wallet.signTransaction(approvalTx);
        const signedTx = await wallet.signTransaction(tx);
        wallet.provider!.broadcastTransaction(signedApprovalTx);
        const receipt = await wallet.provider!.broadcastTransaction(signedTx);
        return receipt.hash;
    }

    export async function fastBuyWithWhitelist(
        wallet: Wallet,
        nonce: number,
        pump: string,
        allocation: bigint,
    ) {
        const maximumIn = parseEther('5000');
        const approvalData = ERC20__factory.createInterface().encodeFunctionData(
            "approve",
            [
                pump,
                maximumIn
            ]
        )
        const approvalTx: TransactionRequest = {
            from: wallet.address,
            to: HOLD_ADDRESS,
            gasLimit: 1_000_000n,
            gasPrice: 100_000_000n,
            data: approvalData,
            nonce: nonce++,
            type: 0,
            chainId: BigInt(CHAIN_ID)
        }
        const id =
            Date.now().toString() +
            BigInt('0x' + crypto.randomUUID().replace(/-/g, '')).toString();
        const expiredBlockNumber = Date.now() + 100000000;
        const signature = await sign({
            id,
            pumpAddress: pump,
            walletAddress: wallet.address,
            remainingAmountAllocation: allocation,
            expiredBlockNumber
        })

        const data = Meme__factory.createInterface().encodeFunctionData(
            "whitelistBuyExactOut",
            [
                allocation,
                maximumIn,
                wallet.address,
                id,
                allocation,
                expiredBlockNumber,
                signature
            ]
        );
        const tx: TransactionRequest = {
            from: wallet.address,
            to: pump,
            gasLimit: 1_000_000n,
            gasPrice: 100_000_000n,
            data,
            nonce,
            type: 0,
            chainId: BigInt(CHAIN_ID)
        }

        const signedApprovalTx = await wallet.signTransaction(approvalTx);
        const signedTx = await wallet.signTransaction(tx);
        wallet.provider!.broadcastTransaction(signedApprovalTx);
        const receipt = await wallet.provider!.broadcastTransaction(signedTx);
        return receipt.hash;
    }

    export async function prepareForWhitelistBuy(
        wallet: Wallet,
        nonce: number,
        pump: string,
        allocation: bigint
    ) {
        const maximumIn = parseEther('5000');

        const id =
            Date.now().toString() +
            BigInt('0x' + crypto.randomUUID().replace(/-/g, '')).toString();
        const expiredBlockNumber = Date.now() + 100000000;
        const signature = await sign({
            id,
            pumpAddress: pump,
            walletAddress: wallet.address,
            remainingAmountAllocation: allocation,
            expiredBlockNumber
        })

        const data = Meme__factory.createInterface().encodeFunctionData(
            "whitelistBuyExactOut",
            [
                allocation,
                maximumIn,
                wallet.address,
                id,
                allocation,
                expiredBlockNumber,
                signature
            ]
        );
        const tx: TransactionRequest = {
            from: wallet.address,
            to: pump,
            gasLimit: 1_000_000n,
            gasPrice: 100_000_000n,
            data,
            nonce,
            type: 0,
            chainId: BigInt(CHAIN_ID)
        }

        const signedTx = await wallet.signTransaction(tx);

        return signedTx;
    }

    export async function prepareForBuy(
        wallet: Wallet,
        nonce: number,
        pump: string,
        amountIn: bigint
    ) {
        const data = Meme__factory.createInterface().encodeFunctionData(
            "swapExactIn",
            [
                amountIn,
                0n,
                true,
                wallet.address
            ]
        );
        const tx: TransactionRequest = {
            from: wallet.address,
            to: pump,
            gasLimit: 1_000_000n,
            gasPrice: 100_000_000n,
            data,
            nonce,
            type: 0,
            chainId: BigInt(CHAIN_ID)
        }
        const signedTx = await wallet.signTransaction(tx);
        return signedTx;
    }
}