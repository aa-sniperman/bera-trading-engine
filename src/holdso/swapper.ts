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
    await approveTokenIfNeeded(privKey, params.tokenIn as string, params.amountIn as bigint);
    const wallet = new Wallet(privKey, PROVIDER);
    const routerContract = HoldsoRouter__factory.connect(HOLDSO_ROUTER_ADDRESS, wallet);
    console.log(params)
    const tx = await routerContract.exactInputSingle(params);
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
      gasLimit: 2_000_000n,
      gasPrice: 100_000_000n,
      type: 0,
    }

    const signedTx = await wallet.signTransaction(tx);

    const res = await wallet.provider!.broadcastTransaction(signedTx);

    return res.hash;
  }
}