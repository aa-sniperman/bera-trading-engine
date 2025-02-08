import axios from "axios";
import { Wallet } from "ethers";
import { NATIVE, SWAP_ROUTER_ADDRESSES, SWAP_ROUTER_GATEWAY_DNS } from "src/constants";
import { Token } from "src/token";

export namespace HoldsoAggSwapper {
    export async function executeSwap({
        wallet,
        from, //Source token address.
        to, //Destination token address.
        amountIn, // Amount of the source token to swap. 1000000000000000000 -> 1e18 ~~ 1 BERA
        slippage, // Allowed slippage in percentage. example: 0.05 -> 5%
    }: {
        wallet: Wallet,
        from: string;
        to: string;
        amountIn: string;
        slippage: number;
    }) {
        const isFromNative = isNativeToken(from);
        if (!isFromNative)
            await Token.approveIfNeeded(wallet, SWAP_ROUTER_ADDRESSES, from, BigInt(amountIn))
        // Step 2 call get quote
        const data: { data: ResponseData } = await axios.get(
            `${SWAP_ROUTER_GATEWAY_DNS}/swap`,
            {
                params: {
                    src: from,
                    dst: to,
                    amount: amountIn,
                    receiver: wallet.address,
                    slippage,
                },
            }
        );

        const valueBatchTx = isFromNative ? amountIn : "0";

        const populatedTx = {
            data: data.data.tx.data,
            from: wallet.address,
            to: SWAP_ROUTER_ADDRESSES,
            value: valueBatchTx,
        };

        // Step 3: send transaction to swap
        const tx = await wallet.sendTransaction(populatedTx);

        await tx.wait();

        return tx.hash;
    }

    /// Step 1: Call get quote
    // curl --location 'https://swap.hold.so/bartio/api/swap?src=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee&dst=0x123C070bFC0267Ea7905CFD691dDC78963443D86&amount=1000000000000000000&receiver=0xd92144d6bf421aa038f872545aaf07b4328db279' \
    // --header 'accept: */*' \
    // --header 'accept-language: en-US,en;q=0.9,vi-VN;q=0.8,vi;q=0.7,fr-FR;q=0.6,fr;q=0.5' \
    // --header 'cache-control: no-cache' \
    // --header 'origin: https://bera-holdso-fork.vercel.app' \
    // --header 'pragma: no-cache' \
    // --header 'priority: u=1, i' \
    // --header 'referer: https://bera-holdso-fork.vercel.app/' \
    // --header 'sec-ch-ua: "Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"' \
    // --header 'sec-ch-ua-mobile: ?0' \
    // --header 'sec-ch-ua-platform: "macOS"' \
    // --header 'sec-fetch-dest: empty' \
    // --header 'sec-fetch-mode: cors' \
    // --header 'sec-fetch-site: cross-site' \
    // --header 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

    /// Step 2: Send transaction

    // Run SwapHoldSo to swap

    // ================================================================================================
    // Type

    interface Swap {
        from: string;
        to: string;
        amount: string;
        pool: string;
        protocol: string;
    }

    interface Protocol {
        amount: string;
        swaps: Swap[];
    }

    interface Quote {
        src: string;
        dst: string;
        amount: string;
        amountUsd: number;
        toAmount: string;
        toAmountUsd: number;
        feePercent: number;
        feeUsd: number;
        minReceive: string;
        protocols: Protocol[];
    }

    interface Tx {
        data: string;
    }

    // Root interface combining everything
    interface ResponseData {
        quote: Quote;
        tx: Tx;
    }

    //Checks if the given contract address is the native token.
    function isNativeToken(contractAddress: string) {
        if (contractAddress.toLowerCase() === NATIVE.toLowerCase()) {
            return true;
        }

        // Get ra native token cua tung chain
        //   const nativeToken = getNativeToken(); ->
        //   if (contractAddress.toLowerCase() === nativeToken?.contract_address?.toLowerCase()) {
        //     return true;
        //   }

        return false;
    }
}