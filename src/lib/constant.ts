export const ZERO_ADDRESS = "dfs_0x0000000000000000000000000000000000000000";
/**
 * Whitelisted `non_users` documents that should render an address detail page
 * even though their id does not follow the `dfs_0x…` (length 46) format. Each
 * entry must match the doc id (and `walletAddress` field) inside the
 * `non_users` Firestore collection.
 *
 *  - `dfs_poiup_airdrop_pool`     : Poipi airdrop pool wallet
 *  - `dfs_nft_marketplace_pool`   : DFS Chain Marketplace NFT custody pool
 */
export const NON_USER_ADDRESS = [
  "dfs_poiup_airdrop_pool",
  "dfs_nft_marketplace_pool",
];
export const DFS_BASE_FEE_IN_USD = 0.01; // $0.01
export const DFS_CIRCULATION_SUPPLY = 100_000_000;
