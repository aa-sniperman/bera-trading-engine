import { parseEther, Wallet } from "ethers";
import { env } from "./configs";
import { PROVIDER } from "./constants";
import { MemeLauncher } from "./meme/launcher";
import { MemeSwap } from "./meme/swap";

async function main() {
    const pk = env.keys.pk;

    const wallet = new Wallet(pk, PROVIDER);

    const token = '0xAc9853af82AE0027e5a0C559b5d56132C6D3b28a';
    const pump = await MemeSwap.getPump(token);

    // const hash = await MemeSwap.buy(wallet, pump, parseEther('0.01'));
    // console.log(hash);

    const hash = await MemeSwap.sell(wallet, token, pump, parseEther('7000'));
    console.log(hash);
}

main();