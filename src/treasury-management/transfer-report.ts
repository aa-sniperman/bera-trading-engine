import { TokenStats } from "src/token-stats";
import { formatEther } from "ethers";
import { TokenConfigInfo } from "src/constants";
import { writeFileSync } from "fs";

export async function fetchAccountSwapTransfers(account: string, token: string, dexAddresses: string[]) {
    const data = await TokenStats.extractERC20Transfers({
        token,
        address: account
    })

    const transfers = data.filter(t =>
        t.from.toLowerCase() === account.toLowerCase() &&
        dexAddresses.map(a => a.toLowerCase()).includes(t.to.toLowerCase())
    )

    const receipts = data.filter(t =>
        t.to.toLowerCase() === account.toLowerCase() &&
        dexAddresses.map(a => a.toLowerCase()).includes(t.from.toLowerCase())
    );

    return {
        transfers, receipts
    }
}
export async function reportSwapTransfers(
    accounts: string[],
    token: string,
    dexAddresses: string[]
) {
    // @ts-ignore
    let transfers: any[] = [];
    let receipts: any[] = [];
    for (const address of accounts) {
        const data = await TokenStats.extractERC20Transfers({
            token,
            address
        })

        const addressTransfers = data.filter(t =>
            t.from.toLowerCase() === address.toLowerCase() &&
            dexAddresses.map(a => a.toLowerCase()).includes(t.to.toLowerCase())
        )
        transfers = transfers.concat(addressTransfers);

        const addressReceipts = data.filter(t =>
            t.to.toLowerCase() === address.toLowerCase() &&
            dexAddresses.map(a => a.toLowerCase()).includes(t.from.toLowerCase())
        );
        receipts = receipts.concat(addressReceipts);
    }

    console.log(transfers.length, receipts.length);

    writeFileSync('./src/transfer.json', JSON.stringify(transfers.map(t => {
        return {
            hash: t.hash,
            from: t.from,
            to: t.to
        }
    })), 'utf-8');
    writeFileSync('./src/receipts.json', JSON.stringify(receipts.map(t => {
        return {
            hash: t.hash,
            from: t.from,
            to: t.to
        }
    })), 'utf-8');
    console.log('------------')

    const totalTransfer = transfers.reduce((sum, transaction) => {
        return sum + Number(formatEther(transaction.value));
    }, 0);

    const totalReceive = receipts.reduce((sum, transaction) => {
        return sum + Number(formatEther(transaction.value));
    }, 0);

    return {
        totalReceive,
        totalTransfer
    }
}
export async function reportTransfers(
    accounts: string[],
    token: string,
) {
    // @ts-ignore
    let transfers: any[] = [];
    let receipts: any[] = [];
    for (const address of accounts) {
        const data = await TokenStats.extractERC20Transfers({
            token,
            address
        })
        transfers = transfers.concat(data.filter(t => t.from.toLowerCase() === address.toLowerCase()));

        receipts = receipts.concat(data.filter(t => t.to.toLowerCase() === address.toLowerCase()));

    }

    const totalTransfer = transfers.reduce((sum, transaction) => {
        return sum + Number(formatEther(transaction.value));
    }, 0);

    const totalReceive = receipts.reduce((sum, transaction) => {
        return sum + Number(formatEther(transaction.value));
    }, 0);

    return {
        totalReceive,
        totalTransfer
    }
}

export async function reportClusterTransfers(
    token: string,
    accounts: string[]
) {
    // @ts-ignore
    const transferData = await reportTransfers(
        accounts,
        token,
    );

    return {
        totalTransfer: transferData.totalTransfer,
        totalReceive: transferData.totalReceive,
    }
}

export async function reportClusterSwapTransfers(
    token: string,
    accounts: string[],
    dexAddresses: string[]
) {
    // @ts-ignore
    const transferData = await reportSwapTransfers(
        accounts,
        token,
        dexAddresses
    );

    return {
        totalTransfer: transferData.totalTransfer,
        totalReceive: transferData.totalReceive,
    }
}