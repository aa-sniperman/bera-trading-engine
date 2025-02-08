import { HOLD_ADDRESS, TokenConfig } from "./constants";
import { Keys } from "./keys";
import { VolumeMakerV2 } from "./vol-maker/vol-v2";

async function main() {
    const makers = require('src/secrets/besa/end-keys.json') as Keys.WalletKey[];
    const volMaker = new VolumeMakerV2.Maker(makers, HOLD_ADDRESS, TokenConfig.BERA, {
        targetVol1h: 100000,
        minTradeSize: 0,
        timeScale: 1,
        maxWalletsNum: 50,
        disableRebalancing: true
    })
    await volMaker.run();
}

main().then();