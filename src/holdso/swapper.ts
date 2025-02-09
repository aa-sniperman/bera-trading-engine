import { TransactionRequest, Wallet } from "ethers";
import { CHAIN_ID, HOLDSO_ROUTER_ADDRESS, MAX_UINT256, PROVIDER, WRAPPED_NATIVE } from "src/constants";
import { ERC20__factory, HoldsoRouter__factory } from "src/contracts";
import { ISwapRouter } from "src/contracts/HoldsoRouter";
export namespace HoldsoSwap {

  export async function approveTokenIfNeeded(privKey: string, token: string, minAmount: bigint) {
    const wallet = new Wallet(privKey, PROVIDER);
    const tokenContract = ERC20__factory.connect(token, wallet);
    const allowance = await tokenContract.allowance(wallet.address, HOLDSO_ROUTER_ADDRESS);
    console.log(allowance)
    if (allowance < minAmount) {
      const tx = await tokenContract.approve(HOLDSO_ROUTER_ADDRESS, MAX_UINT256);
      console.log(tx.hash)
      await tx.wait();
    }
  }

  export async function executeSwap(privKey: string, params: ISwapRouter.ExactInputSingleParamsStruct) {
    if (params.tokenIn !== WRAPPED_NATIVE)
      await approveTokenIfNeeded(privKey, params.tokenIn as string, params.amountIn as bigint);
    const wallet = new Wallet(privKey, PROVIDER);
    const routerContract = HoldsoRouter__factory.connect(HOLDSO_ROUTER_ADDRESS, wallet);
    const tx = await routerContract.exactInputSingle(params, {
      value: params.tokenIn === WRAPPED_NATIVE ? params.amountIn : 0n
    });
    await tx.wait();
    return tx.hash;
  }

  export async function fastSwap(
    wallet: Wallet,
    nonce: number,
    params: ISwapRouter.ExactInputSingleParamsStruct
  ) {

    const txData = HoldsoRouter__factory.createInterface().encodeFunctionData(
      "exactInputSingle",
      [params]
    )

    const tx: TransactionRequest = {
      from: wallet.address,
      to: HOLDSO_ROUTER_ADDRESS,
      data: txData,
      value: '0x0',
      chainId: CHAIN_ID,
      nonce,
      gasLimit: 2e6,
      maxPriorityFeePerGas: 1e6,
      maxFeePerGas: 1e8
    }

    const signedTx = await wallet.signTransaction(tx);

    const res = await wallet.provider!.broadcastTransaction(signedTx);

    return res.hash;
  }
}