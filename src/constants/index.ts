import { ethers, JsonRpcProvider } from "ethers";
import { symbol } from "joi";
import { env } from "src/configs";

const isMainnet = env.network === 'mainnet';

const rpc = isMainnet ? env.bera.mainnetRpc : env.bera.testnetRpc;

export const PROVIDER = new JsonRpcProvider(rpc);

export const HOLD_ADDRESS = isMainnet ? '0xFF0a636Dfc44Bb0129b631cDd38D21B613290c98' : '0x7e5f556a859502b8Ba590dAFb92d37573D944DF8';
export const HOLDSO_ROUTER_ADDRESS = isMainnet ? '0x3982F5CcbaE0cdA43fb7b3c669EecB361E012dcC' : '0x3982F5CcbaE0cdA43fb7b3c669EecB361E012dcC';
export const HOLD_BERA_PAIR = '0xAD28e28d64Fb46c785246d0468dEc1c89C1774bA'
export const SWAP_ROUTER_GATEWAY_DNS = "https://swap.hold.so/berachain/api";

// Mapping of chain IDs to swap router contract addresses
export const SWAP_ROUTER_ADDRESSES = "0x7d55D31adFde09f48d35cfcA13c08A31EBc790CB";

export const NATIVE = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
export const WRAPPED_NATIVE = isMainnet ? '0x6969696969696969696969696969696969696969' : '0x4200000000000000000000000000000000000006';

export const MULTICALL_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11';

export const BERAIS_FACTORY = isMainnet ? '0xeA5Bc60A006AFA9Fb9B3929280544a26246e490D' : '0xC59C785cFAa33C0d4a4565f00C0062f7757eAF9a';

export const CHAIN_ID = isMainnet ? 80094 : 80084;
export const MAX_UINT256 = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export interface TokenConfigInfo {
    address: string,
    pair: string,
    symbol: string,
  }
  export const TokenConfig = {
    BERA: {
      address: WRAPPED_NATIVE,
      pair: HOLD_BERA_PAIR,
      symbol: "BERA"
    }
  }