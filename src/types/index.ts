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
  /**
   * NFT metadata populated by `dfs_marketplace` mirrors and Metaface NFT sends.
   * When `method === "NFT Transfer"`, the value column should render this
   * (token id + symbol) instead of treating `amount` as DFS.
   */
  nft?: {
    contractAddress?: string;
    tokenId?: string;
    name?: string;
    symbol?: string;
    imageUrl?: string;
  };
  /** Top-level mirror fields written by the marketplace, also present on Metaface NFT sends. */
  collectionId?: string;
  tokenId?: string;
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

/** DRC721-style mint held under `nfts/{collectionId}/tokens` (or legacy `tokens`). */
export interface ScanNftHolding {
  docId: string;
  collectionId: string;
  tokenId: string;
  name: string;
  image: string;
  state?: string;
  owner: string;
  tokenURI?: string;
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
