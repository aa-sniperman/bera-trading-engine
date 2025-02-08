import { ethers, JsonRpcProvider } from "ethers";
import { env } from "src/configs";

const isMainnet = env.network === 'mainnet';

const rpc = isMainnet ? env.bera.mainnetRpc : env.bera.testnetRpc;

console.log(rpc)
export const PROVIDER = new JsonRpcProvider(rpc);

export const HOLD_ADDRESS = isMainnet ? '0xFF0a636Dfc44Bb0129b631cDd38D21B613290c98' : '0x7e5f556a859502b8Ba590dAFb92d37573D944DF8';
export const HOLDSO_ROUTER_ADDRESS = isMainnet ? '0x3982F5CcbaE0cdA43fb7b3c669EecB361E012dcC' : '0x3982F5CcbaE0cdA43fb7b3c669EecB361E012dcC';

export const NATIVE = ethers.ZeroAddress;
export const WRAPPED_NATIVE = '0x4200000000000000000000000000000000000006';

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
    PUMPE: {
      address: "0xCb36d532a9995F4471C99868F8DA775B7a23eBB8",
      pair: '0x8d57Aa133B98cf9F13bF7CDaE269fC4d29ADcC55',
      symbol: 'PUMPE'
    },
    TRUMPE: {
      address: "0x97dA6cfeEaaCbf1b2848FEa96C1c36882f96b4D1",
      pair: "",
      symbol: "TRUMPE"
    }
  }