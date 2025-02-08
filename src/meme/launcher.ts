import axios from "axios";
import { parseEther, Wallet, ZeroAddress } from "ethers";
import { env } from "src/configs";
import { BERAIS_FACTORY, HOLD_ADDRESS, MAX_UINT256, PROVIDER } from "src/constants";
import { ERC20__factory, MemeFactory__factory } from "src/contracts";
import { IMemeFactory } from "src/contracts/MemeFactory";

export enum MemeType {
    DEFAI = 'DEFAI',
    Trading = 'Trading',
    HedgeFund = 'HedgeFund',
    Entertainment = 'Entertainment',
    Meme = 'Meme',
    Conversational = 'Conversational',
    IP = 'IP',
    BigData = 'BigData',
}

export enum MemeOriginType {
    Inside = 'Inside',
    Outside = 'Outside',
}

export namespace MemeLauncher {
    const listingSqrtPriceX96 = BigInt('345347553882095402512867905');

    const totalSupply = parseEther((1e9).toString());
    const saleAmount = parseEther((7.9e8).toString());
    const reservedSupply = parseEther((1e7).toString());
    const tokenOffset = parseEther((263333333.333333).toString());
    const nativeOffset = parseEther((1333.33333333333).toString());
    const creationFee = parseEther('20');

    export async function approveHold(
        wallet: Wallet,
        amount: bigint
    ) {
        const tokenSc = ERC20__factory.connect(HOLD_ADDRESS, wallet);
        const tx = await tokenSc.approve(BERAIS_FACTORY, amount);
        await tx.wait();
        return tx.hash;
    }
    export async function approveHoldIfNeeded(
        wallet: Wallet,
        amount: bigint
    ) {
        const tokenSc = ERC20__factory.connect(HOLD_ADDRESS, wallet);
        const allowance = await tokenSc.allowance(wallet.address, BERAIS_FACTORY);
        if (allowance < amount) {
            await approveHold(wallet, BigInt(MAX_UINT256));
        }
    }

    export async function getValidTokenId() {
        const nativeAddress = '0x7e5f556a859502b8Ba590dAFb92d37573D944DF8'; // sau thay bằng HOLD address

        for (let i = 0; i < 30; i++) {
            const tokenId =
                Date.now().toString() + Math.floor(1e15 * Math.random()) +
                BigInt('0x' + crypto.randomUUID().replace(/-/g, '')).toString();
            console.log(`Token Id: `, tokenId);

            const factory = MemeFactory__factory.connect(BERAIS_FACTORY, PROVIDER);
            const tokenAddress = await factory.getMemeAddress(tokenId);
            console.log(tokenAddress)
            if (BigInt(tokenAddress) < BigInt(nativeAddress)) {
                console.log(`Found it!`)
                return { tokenAddress, tokenId };
            }
        }
    }
    export async function postTotalAllocation() {
        const axiosClient = axios.create({
            baseURL: env.api.endPoint,
            headers: {
                'x-secret': env.api.apiSecret,
                accept: '*/*',
            }
        })

        const postAllocationEndpoint = '/api/allocations/allocate-stake-allocation';
        const body = {
            "tokenAddress": "0x4E0cD80653392c3fc9f316E931F72a5d6c548901",
            "totalSupplyPercent": 20
        }

        await axiosClient.post(postAllocationEndpoint, body);
    }

    export async function postAllocation() {
        const axiosClient = axios.create({
            baseURL: env.api.endPoint,
            headers: {
                'x-secret': env.api.apiSecret,
                accept: '*/*',
            }
        })

        const postAllocationEndpoint = '/api/allocations'
        const body = {
            "tokenAddress": "0x4E0cD80653392c3fc9f316E931F72a5d6c548901",
            "allocations": [
                {
                    "walletAddress": "0xdD54e5d81B9f829AeDE8AA17d35242285a96AF96",
                    "tokenAmount": parseEther((1e7).toString()).toString()
                }
            ]
        }

        await axiosClient.post(postAllocationEndpoint, body);
    }
    export async function createWhitelistMeme(wallet: Wallet) {
        const axiosClient = axios.create({
            baseURL: env.api.endPoint,
            headers: {
                'x-secret': env.api.apiSecret,
                accept: '*/*',
                'wallet-address': wallet.address
            }
        })
        const idData = await getValidTokenId();
        if (!idData) throw new Error(`Can't find valid token id`);

        const initialDeposit = parseEther('100');
        const nowInSecs = Math.floor(Date.now() / 1000);

        const image = 'https://ipfs.io/ipfs/QmWYP2PK6q3TqvbipyPd3onMSKU1KC9qiTe6FgRGmHxjVy';
        const postOffchainEndpoint = '/api/meme'

        const postOffchainBody = {
            "tokenAddress": idData.tokenAddress,
            "originType": MemeOriginType.Inside,
            "image": image,
            "description": "Straight Flush meets Royal Flush",
            "website": "",
            "x": "",
            "telegram": "",
            "discord": "",
            "github": "",
            "types": [
                MemeType.BigData, MemeType.Conversational
            ]
        }

        await axiosClient.post(postOffchainEndpoint, postOffchainBody);

        const params: IMemeFactory.MemeCreationParamsStruct = {
            name: "Test whitelist staking HOLD",
            symbol: "TWH",
            tokenId: idData.tokenId,
            tokenOffset,
            nativeOffset,
            totalSupply,
            saleAmount,
            reservedSupply,
            initialDeposit,
            whitelistStartTs: nowInSecs + 26 * 60,
            whitelistEndTs: nowInSecs + 36 * 60,
            stakeEndTs: nowInSecs + 16 * 60,
            lockEndTs: nowInSecs + 60 * 60,
            lockedToken: HOLD_ADDRESS,
            listingSqrtPriceX96,
            listingFeeTier: 3000
        }

        await approveHoldIfNeeded(wallet, creationFee + initialDeposit);

        const factoryContract = MemeFactory__factory.connect(BERAIS_FACTORY, wallet);

        const tx = await factoryContract.createMeme(params);
        await tx.wait();
        console.log(tx.hash);

        return tx.hash;
    }
}