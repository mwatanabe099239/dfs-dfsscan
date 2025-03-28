export interface Transaction {
  amount: string;
  blockNumber: number;
  createdAt: Date;
  fromAddress: string;
  fromEmail: string;
  gasFee: string;
  message: string;
  method: string;
  toAddress: string;
  toEmail: string;
  token: {
    id: string;
    logoUrl: string;
    name: string;
    symbol: string;
    tokenAddress: string;
  };
  transactionHash: string;
}

export interface Block {
  number: number;
  timestamp: number;
  transactions: number;
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