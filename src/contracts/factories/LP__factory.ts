/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type { LP, LPInterface } from "../LP";

const _abi = [
  {
    type: "function",
    name: "getReserves",
    inputs: [],
    outputs: [
      {
        name: "reserve0",
        type: "uint112",
        internalType: "uint112",
      },
      {
        name: "reserve1",
        type: "uint112",
        internalType: "uint112",
      },
      {
        name: "blockTimestampLast",
        type: "uint32",
        internalType: "uint32",
      },
    ],
    stateMutability: "view",
  },
] as const;

export class LP__factory {
  static readonly abi = _abi;
  static createInterface(): LPInterface {
    return new Interface(_abi) as LPInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): LP {
    return new Contract(address, _abi, runner) as unknown as LP;
  }
}
