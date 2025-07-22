export interface Transaction {
  amount: string;
  blockNumber: number;
  createdAt: Date | any;
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
    totalSupply: string;
  };
  transactionHash: string;
  allTransfers?: {
   fromAddress: string;
   toAddress: string;
   amount: number;
   token: {
    id: string;
    logoUrl: string;
    name: string;
    symbol: string;
    address: string;
   } 
  }[];
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
  onChainTokenPrice: {
    priceUsd: number;
    priceChange: {
      m5: number;
      h1: number;
      h6: number;
      h24: number;
    };
  };
  dfsCirculationSupply: number;
  latestBlock: number;
  dfsTransactionCount: number;
  twoWeekTransactionHistory: any[];
  holdersCount: number;
  dfsBaseFee: number;
}
