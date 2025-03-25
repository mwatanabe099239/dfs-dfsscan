import SearchBar from './components/SearchBar'
import NetworkStatsSection from './components/home/NetworkStats'
import LatestBlocks from './components/home/LatestBlocks'
import LatestTransactions from './components/home/LatestTransactions'

// Temporary mock data - replace with Firebase data later
const mockNetworkStats = {
  bnbPrice: 610.63,
  transactions24h: 6952.75,
  tps: 82.1,
  medianGasPrice: '1 Gwei',
  medianGasPriceUSD: '$0.01',
  bnbMarketCap: 91809388782.00,
  bnbSupply: 150352322,
  latestBlock: 47605447,
  blockTime: 3,
  votingPower: 30307620.04,
  btcPrice: 0.007243,
  priceChange: -2.71
}

const mockBlocks = [
  {
    number: 47605447,
    timestamp: Date.now() / 1000,
    transactions: 169,
    validator: 'MathWallet',
    validatorAddress: '0x2465176C461AfB316ebc773C61fA2E77491D44D7',
    reward: 0.25841
  },
  {
    number: 47605446,
    timestamp: Date.now() / 1000 - 3,
    transactions: 203,
    validator: 'MathWallet',
    validatorAddress: '0x2465176C461AfB316ebc773C61fA2E77491D44D7',
    reward: 0.05587
  },
  {
    number: 47605445,
    timestamp: Date.now() / 1000 - 6,
    transactions: 211,
    validator: 'MathWallet',
    validatorAddress: '0x2465176C461AfB316ebc773C61fA2E77491D44D7',
    reward: 0.05591
  },
  {
    number: 47605444,
    timestamp: Date.now() / 1000 - 9,
    transactions: 203,
    validator: 'MathWallet',
    validatorAddress: '0x2465176C461AfB316ebc773C61fA2E77491D44D7',
    reward: 0.07574
  },
  {
    number: 47605443,
    timestamp: Date.now() / 1000 - 12,
    transactions: 223,
    validator: 'The48Club',
    validatorAddress: '0x70F657164e5b75689b64B7fd1fA275F334f28e18',
    reward: 0.05132
  },
  {
    number: 47605442,
    timestamp: Date.now() / 1000 - 15,
    transactions: 263,
    validator: 'The48Club',
    validatorAddress: '0x70F657164e5b75689b64B7fd1fA275F334f28e18',
    reward: 0.04872
  }
]

const mockTransactions = [
  {
    hash: '0x36baeb08a3c79b79725b6fd6d423c89d46f228e7d2f3bbdb7ad4c031fb0ec2c5',
    timestamp: Date.now() / 1000,
    from: '0x96c8D1bD7C8811DCe5d95C107383D4EB45Cd42F3b7E',
    to: '0x48B2665E8c86f675f2C4B4B2665EB660BB48',
    value: 0.25841
  },
  {
    hash: '0xd28c85e7f5b7d8c8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8',
    timestamp: Date.now() / 1000 - 3,
    from: '0x96c8D1bD7C8811DCe5d95C107383D4EB45Cd42F3b7E',
    to: '0x48B2665E8c86f675f2C4B4B2665EB660BB48',
    value: 0
  },
  {
    hash: '0xc86ec65dd4c8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8',
    timestamp: Date.now() / 1000 - 6,
    from: '0x39864e16f5b7d8c8f8d8f8d8f8d8f8d8f9EBab8C',
    to: '0x3199A64B8c86f675f2C4B4B2665Ed81D8a9a',
    value: 0
  },
  {
    hash: '0xa562e010e8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8',
    timestamp: Date.now() / 1000 - 9,
    from: '0xeC5f18177C8811DCe5d95C107383D4EB544d11242',
    to: '0x55d398326f99059fF775485246999027B3197955',
    value: 0
  },
  {
    hash: '0xb75748da87c8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8',
    timestamp: Date.now() / 1000 - 12,
    from: '0xb0471E227C8811DCe5d95C107383D4EBc6C48D4ee',
    to: '0x81DA6BCd8c86f675f2C4B4B26650B7e16D97',
    value: 1.00278
  },
  {
    hash: '0x461b0920a0c8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8f8d8',
    timestamp: Date.now() / 1000 - 15,
    from: '0x8AfC9b377C8811DCe5d95C107383D4EBb3adC68df',
    to: '0x55d398326f99059fF775485246999027B3197955',
    value: 0
  }
]

export default function Home() {
  return (
    <div>
      {/* Full width black background section */}
      <div className="absolute top-0 left-0 w-full h-[350px] bg-[#131313] bg-[url('/icons/waves-light.svg')] bg-repeat z-[-1]">
        {/* Content container */}

      </div>

      {/* Overview section - positioned to overlap the black background */}
      <div className="px-4 -mt-12">
        <div className="pt-16 mb-16">
          <div className="text-left mb-2">
            <h1 className="text-xl text-white mb-1">
              BNB Smart Chain Explorer
            </h1>
          </div>
          <SearchBar />
        </div>
        <div className="bg-white rounded-lg shadow-lg mb-6">
          {/* Overview content */}
          <div className="p-4">
            <NetworkStatsSection stats={mockNetworkStats} />
          </div>
        </div>

        {/* Blocks and Transactions section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Latest Blocks */}
          <div className="bg-white rounded-lg shadow-lg lg:col-span-1">
            <h2 className="text-md font-semibold p-4 border-b border-gray-200">Latest Blocks</h2>
            <LatestBlocks blocks={mockBlocks} />
          </div>

          {/* Latest Transactions */}
          <div className="bg-white rounded-lg shadow-lg lg:col-span-1">
            <h2 className="text-md font-semibold p-4 border-b border-gray-200">Latest Transactions</h2>
            <LatestTransactions transactions={mockTransactions} />
          </div>
        </div>
      </div>
    </div>
  )
}
