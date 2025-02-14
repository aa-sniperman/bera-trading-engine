import { ethers, parseEther } from "ethers";
import vip from "./a1.json";
import novip from "./a2.json";
import { Keys } from "./keys";
import { AllocationTier, MemeLauncher } from "./meme/launcher";
const buyerKeys = require('src/secrets/bb/buyers.json') as Keys.WalletKey[]

const buyerAddresses = buyerKeys.map(k => k.address);

async function check() {
    for (const vipW of vip) {
        const dup = novip.find(e => e[0] === vipW[0])
        if (dup) {
            console.log('Novip')
            console.log(dup)
            console.log('Vip')
            console.log(vipW)
        }
    }
}
async function main(tier: AllocationTier) {
    const allocations = tier === AllocationTier.VIP ? vip : novip;
    console.log(allocations)
    let data = [];

    const startingIdx = allocations.findIndex(e => e[0] === "hst");

    const buyerLength = allocations.length - startingIdx;

    const l = startingIdx > 0 ? startingIdx : allocations.length
    for (let i = 0; i < l; i++) {
        const entry = allocations[i];
        const walletAddress = entry[0];
        data.push({
            walletAddress: ethers.getAddress(walletAddress.toString()),
            tokenAmount: parseEther((entry[1]).toString()).toString(),
            tier
        })
    }

    if (startingIdx > 0)
        for (let i = 0; i < buyerLength; i++) {
            const entry = allocations[i + startingIdx];
            const walletAddress = buyerAddresses[i];
            data.push({
                walletAddress: ethers.getAddress(walletAddress.toString()),
                tokenAmount: parseEther((entry[1]).toString()).toString(),
                tier
            })
        }

    console.log(data);
    console.log(data.length);

    await MemeLauncher.postAllocation('0x3262336B903F8DeCB1d9c9259138065d6c6E2e6F', data);

}

main(AllocationTier.VIP).then();