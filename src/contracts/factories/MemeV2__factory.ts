/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type { MemeV2, MemeV2Interface } from "../MemeV2";

const _abi = [
  {
    type: "function",
    name: "BASIS_POINTS",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "MAX_TOKENS",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "UNIV3_FACTORY",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IUniswapV3Factory",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "factory",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IMemeFactory",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "idUsed",
    inputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "initialBuy",
    inputs: [
      {
        name: "amountIn",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "recipient",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "initialize",
    inputs: [
      {
        name: "_token",
        type: "address",
        internalType: "address",
      },
      {
        name: "_native",
        type: "address",
        internalType: "address",
      },
      {
        name: "_univ3Factory",
        type: "address",
        internalType: "address",
      },
      {
        name: "_uniswapPair",
        type: "address",
        internalType: "address",
      },
      {
        name: "_saleAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_reservedSupply",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_tokenOffset",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_nativeOffset",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_whitelistStartTs",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_whitelistEndTs",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_listingSqrtPriceX96",
        type: "uint160",
        internalType: "uint160",
      },
      {
        name: "_listingFeeTier",
        type: "uint24",
        internalType: "uint24",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "injectLiquidity",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "listingFeeTier",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint24",
        internalType: "uint24",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "listingSqrtPriceX96",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint160",
        internalType: "uint160",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "native",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IERC20",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "nativeOffset",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "quoteAmountIn",
    inputs: [
      {
        name: "amountOut",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "isBuyToken",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [
      {
        name: "actualAmountOut",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "amountIn",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "nativeFee",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "quoteAmountOut",
    inputs: [
      {
        name: "amountIn",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "isBuyToken",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [
      {
        name: "actualAmountIn",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "amountOut",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "nativeFee",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "refund",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "reserveNative",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "reserveToken",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "reservedSupply",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "saleAmount",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "signerAddress",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "swapExactIn",
    inputs: [
      {
        name: "amountIn",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "minimumReceive",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "isBuyToken",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "recipient",
        type: "address",
        internalType: "address",
      },
      {
        name: "onBehalfOf",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "swapExactOut",
    inputs: [
      {
        name: "amountOut",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "maximumPay",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "isBuyToken",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "recipient",
        type: "address",
        internalType: "address",
      },
      {
        name: "onBehalfOf",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "token",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IMemeToken",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenOffset",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [
      {
        name: "newOwner",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "uniswapPair",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "uniswapV3MintCallback",
    inputs: [
      {
        name: "amount0Owed",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "amount1Owed",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "whitelistBuyExactIn",
    inputs: [
      {
        name: "amountIn",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "minimumReceive",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "recipient",
        type: "address",
        internalType: "address",
      },
      {
        name: "id",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tokenAllocation",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "expiredBlockNumber",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "signature",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "amountToken",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "whitelistBuyExactOut",
    inputs: [
      {
        name: "amountOut",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "maximumPay",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "recipient",
        type: "address",
        internalType: "address",
      },
      {
        name: "id",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tokenAllocation",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "expiredBlockNumber",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "signature",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "amountIn",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "whitelistEndTs",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "whitelistStartTs",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "BondingCurveEnded",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "factory",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Buy",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "trader",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "amountToken",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "amountNative",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "reserveToken",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "reserveNative",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "factory",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Initialized",
    inputs: [
      {
        name: "version",
        type: "uint8",
        indexed: false,
        internalType: "uint8",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "List",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "tokenLiquidity",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "reserveLiquidity",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "pair",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "factory",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ListingFeeCollected",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "native",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "treasury1",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "treasury2",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "totalFee",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "feeForTreasury1",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "feeForTreasury2",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "factory",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Sell",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "trader",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "amountToken",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "amountNative",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "reserveToken",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "reserveNative",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "factory",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TradingFeeCollected",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "native",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "treasury1",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "treasury2",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "totalFee",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "feeForTreasury1",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "feeForTreasury2",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "reserveToken",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "reserveNative",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "isBuy",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
      {
        name: "factory",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "WhitelistBuy",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "id",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "amountBought",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "factory",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
] as const;

export class MemeV2__factory {
  static readonly abi = _abi;
  static createInterface(): MemeV2Interface {
    return new Interface(_abi) as MemeV2Interface;
  }
  static connect(address: string, runner?: ContractRunner | null): MemeV2 {
    return new Contract(address, _abi, runner) as unknown as MemeV2;
  }
}
