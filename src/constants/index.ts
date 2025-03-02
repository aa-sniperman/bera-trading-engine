import { ethers, JsonRpcProvider } from "ethers";
import { symbol } from "joi";
import { env } from "src/configs";

const isMainnet = env.network === 'mainnet';

const rpc = isMainnet ? env.bera.mainnetRpc : env.bera.testnetRpc;

export const PROVIDER = new JsonRpcProvider(rpc);

export const HOLD_ADDRESS = isMainnet ? '0xFF0a636Dfc44Bb0129b631cDd38D21B613290c98' : '0x7e5f556a859502b8Ba590dAFb92d37573D944DF8';
export const HOLDSO_ROUTER_ADDRESS = isMainnet ? '0x3982F5CcbaE0cdA43fb7b3c669EecB361E012dcC' : '0x3982F5CcbaE0cdA43fb7b3c669EecB361E012dcC';
export const HOLDSO_AGG_ADDRESS = '0x7d55D31adFde09f48d35cfcA13c08A31EBc790CB';
export const HOLD_BERA_PAIR = '0xAD28e28d64Fb46c785246d0468dEc1c89C1774bA'
export const SWAP_ROUTER_GATEWAY_DNS = "https://swap.hold.so/berachain/api";

// Mapping of chain IDs to swap router contract addresses
export const SWAP_ROUTER_ADDRESSES = "0x7d55D31adFde09f48d35cfcA13c08A31EBc790CB";

export const NATIVE = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
export const WRAPPED_NATIVE = isMainnet ? '0x6969696969696969696969696969696969696969' : '0x4200000000000000000000000000000000000006';

export const MULTISEND_ADDRESS = '0xE3f362f35CD567700A9490f6E803BFA1C7846E7c';
export const MULTICALL_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11';

export const BERAIS_FACTORY = isMainnet ? '0xeA5Bc60A006AFA9Fb9B3929280544a26246e490D' : '0xC59C785cFAa33C0d4a4565f00C0062f7757eAF9a';
export const BERAIS_FACTORY_V2 = '0x2715Dbad296BCC5584998952cFD76ee03c788B34';
export const NATIVE_WRAPPER = '0xAf24D87A919a27A15D88ecBAd3B2F9cf39e4fA4a';
export const KODIAK_ROUTER = '0xe301E48F77963D3F7DbD2a4796962Bd7f3867Fb4';
export const KODIAK_ROUTER_V2 = '0xd91dd58387Ccd9B66B390ae2d7c66dBD46BC6022';
export const CHAIN_ID = isMainnet ? 80094 : 80084;
export const MAX_UINT256 = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export interface TokenConfigInfo {
    address: string,
    pair: string,
    symbol: string,
    pump?: string,
  }
  export const TokenConfig = {
    BERA: {
      address: WRAPPED_NATIVE,
      pair: HOLD_BERA_PAIR,
      symbol: "BERA"
    },
    THOON: {
      address: "0xe80e3b8D439A4c2271CB58076FF79bEB1998179E",
      pair: "0x6C9dD9d1431E8aD2aA0b99002F0019Fb5D0880e5",
      symbol: "THOON",
      pump: "0x5Fc92a62ad5dbdE82c18D5bF51108fCBddB115e7"
    },
    ATI: {
      address: "0x3262336B903F8DeCB1d9c9259138065d6c6E2e6F",
      pair: "0x9aEF6241C191fED841ca45120CeFd582ca8fd0D9",
      symbol: "ATI",
      pump: "0x0D8ED695AB53F000041596677C899De62D41b681"
    },
    BR: {
      address: "0xA6B796408a4B4dDd2ABc064c6193631D0EFD11D5",
      pair: "0x9D9e4E0C159EdFd6De21BCa75BDF5154ab9d4Ce0",
      symbol: "BR",
      pump: ""
    },
    BB: {
      address: "0x5d7768361Bdeb9d492aFF662cFF91ABbd5f3f375",
      pair: "0x3408b63e0B1dC7569d2d7fda73BCb6a66BA79493",
      symbol: "BB",
      pump: ""
    },
    HENLO: {
      address: "0x490e24237BF01119E8C26B8efcDf45Ed9a577539",
      pair: "0x284Cb968C2A2e3bE1ac48CBaF92937DC4C6FD22e",
      symbol: "HENLO",
      pump: ""
    }
  }