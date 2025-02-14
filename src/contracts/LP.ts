/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedListener,
  TypedContractMethod,
} from "./common";

export interface LPInterface extends Interface {
  getFunction(
    nameOrSignature: "getPair" | "getReserves" | "mint"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "getPair",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getReserves",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "mint", values: [AddressLike]): string;

  decodeFunctionResult(functionFragment: "getPair", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getReserves",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "mint", data: BytesLike): Result;
}

export interface LP extends BaseContract {
  connect(runner?: ContractRunner | null): LP;
  waitForDeployment(): Promise<this>;

  interface: LPInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  getPair: TypedContractMethod<
    [tokenA: AddressLike, tokenB: AddressLike],
    [string],
    "view"
  >;

  getReserves: TypedContractMethod<
    [],
    [
      [bigint, bigint, bigint] & {
        reserve0: bigint;
        reserve1: bigint;
        blockTimestampLast: bigint;
      }
    ],
    "view"
  >;

  mint: TypedContractMethod<[to: AddressLike], [bigint], "nonpayable">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "getPair"
  ): TypedContractMethod<
    [tokenA: AddressLike, tokenB: AddressLike],
    [string],
    "view"
  >;
  getFunction(
    nameOrSignature: "getReserves"
  ): TypedContractMethod<
    [],
    [
      [bigint, bigint, bigint] & {
        reserve0: bigint;
        reserve1: bigint;
        blockTimestampLast: bigint;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "mint"
  ): TypedContractMethod<[to: AddressLike], [bigint], "nonpayable">;

  filters: {};
}
