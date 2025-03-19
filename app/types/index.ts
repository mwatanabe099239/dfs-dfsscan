export interface Transaction {
  hash: string;
  method: string;
  block: number;
  timestamp: number;
  from: string;
  to: string;
  value: string;
  fee: string;
  status: 'Success' | 'Failed' | 'Pending';
  gasPrice: string;
}

export interface Block {
  number: number;
  timestamp: number;
  transactions: number;
  miner: string;
  reward: string;
}

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
  price: number;
}

export interface WalletInfo {
  address: string;
  bnbBalance: string;
  bnbBalanceUSD: string;
  tokenHoldings: {
    token: TokenInfo;
    balance: string;
  }[];
}

export interface NetworkStats {
  bnbPrice: number;
  transactions24h: number;
  tps: number;
  medianGasPrice: string;
  bnbMarketCap: number;
  bnbSupply: number;
  latestBlock: number;
  blockTime: number;
  votingPower: number;
} 