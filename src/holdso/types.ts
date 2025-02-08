export interface TransferLog{
    tokenAddress: string;
    from: string;
    to: string;
    amount: bigint;
  }
  
  export interface ContractDeployedLog {
    contractAddress: string;
  }
  
  export enum HoldStationNFPLogType {
    TRANSFER = 'TRANSFER',
    POOL_DEPLOYED = 'POOL_DEPLOYED'
  }
  
  export interface HoldStationNewNativePool {
    poolAddress: string,
    token: string
  }
  
  export interface HoldSoListing {
    pool: string,
    token: string,
  }