import { parseEther, Wallet } from "ethers";
import { env } from "./configs";
import { HOLD_ADDRESS, NATIVE, PROVIDER } from "./constants";
import { MemeLauncher } from "./meme/launcher";
import { MemeSwap } from "./meme/swap";
import { Keys } from "./keys";
import { BoostHoldersViaSwap } from "./vol-maker/boost-holders";

async function main() {
    const pk = env.keys.pk;

    const wallet = new Wallet(pk, PROVIDER);

    const sniperKeys = require('src/secrets/besa/end-keys.json') as Keys.WalletKey[];
    

    await BoostHoldersViaSwap.boostHoldersViaSwaps(
        wallet,
        sniperKeys,
        NATIVE,
        HOLD_ADDRESS,
        sniperKeys.map(k => parseEther('0.1'))
    )
}

main();