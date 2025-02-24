import { formatEther } from "ethers";
import accounts from "./address-list.json";
import { Token } from "../token";
import { TokenStats } from "src/token-stats";
import { ERC20__factory } from "src/contracts";
import { HOLD_ADDRESS, HOLD_BERA_PAIR, PROVIDER, TokenConfigInfo } from "src/constants";


export async function reportSupply(
    baseConfig: TokenConfigInfo
) {
    // @ts-ignore
    const baseAccounts: string[] = accounts[baseConfig.symbol.toLowerCase()];
    const tokenPrice = await TokenStats.getTokenPrice(baseConfig.pair);
    const quotePrice = await TokenStats.getTokenPrice(HOLD_BERA_PAIR);
    const tokenSc = ERC20__factory.connect(baseConfig.address, PROVIDER);
    const quoteSc = ERC20__factory.connect(HOLD_ADDRESS, PROVIDER);
    const totalSupply = Number(formatEther(await tokenSc.totalSupply()));
    const MC = Number(totalSupply) * Number(tokenPrice);
    const balances = await Token.getBalances(baseAccounts, [baseConfig.address, HOLD_ADDRESS], [baseConfig.symbol, 'HOLD']);
    const totalBaseBalance = Number(balances['total'][baseConfig.symbol]);
    const totalQuoteBalance = Number(balances['total']['HOLD']);
    const tokenInPool = Number(formatEther(await tokenSc.balanceOf(baseConfig.pair)));
    const quoteInPool = Number(formatEther(await quoteSc.balanceOf(baseConfig.pair)));
    const quoteInPoolUSD = quoteInPool * Number(quotePrice);
    const controlPercent = 100 * (totalBaseBalance) / (totalSupply);
    const poolPercent = 100 * (tokenInPool) / Number(totalSupply);

    return {
        MC,
        quoteInPool,
        quoteInPoolUSD,
        totalSupply,
        controlPercent,
        poolPercent,
        totalQuoteBalance
    }

}