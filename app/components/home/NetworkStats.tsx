'use client'

import { NetworkStats } from '../../types'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faServer, 
  faGlobe, 
  faGauge 
} from '@fortawesome/free-solid-svg-icons'

interface StatsItemProps {
  icon?: React.ReactNode
  title: string
  mainValue: string
  subValue?: string
  className?: string
}

const StatsItem = ({ icon, title, mainValue, subValue, className = '' }: StatsItemProps) => (
  <div className={`flex items-start gap-3 ${className}`}>
    {icon && (
      <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-gray-500">
        {icon}
      </div>
    )}
    <div>
      <h3 className="text-sm text-gray-500 mb-1">{title}</h3>
      <p className="text-base font-medium">{mainValue}</p>
      {subValue && <p className="text-sm text-gray-500">{subValue}</p>}
    </div>
  </div>
)

// Helper function for consistent number formatting
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}

export default function NetworkStatsSection({ stats }: { stats: NetworkStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
      <StatsItem
        icon={
          <Image 
            src="/icons/bnb.svg" 
            alt="BNB" 
            width={24} 
            height={24}
          />
        }
        title="BNB PRICE"
        mainValue={`$${formatNumber(stats.bnbPrice)}`}
        subValue={`@ ${stats.bnbPrice} BTC (-2.71%)`}
      />
      <StatsItem
        icon={<FontAwesomeIcon icon={faServer} className="text-xl" />}
        title="TRANSACTIONS"
        mainValue={new Intl.NumberFormat('en-US').format(stats.transactions24h)}
        subValue={`(${stats.tps} TPS)`}
      />
      <StatsItem
        title="MED GAS PRICE"
        mainValue={stats.medianGasPrice}
        subValue="($0.01)"
      />
      <StatsItem
        icon={<FontAwesomeIcon icon={faGlobe} className="text-xl" />}
        title="BNB MARKET CAP ON BSC"
        mainValue={`$${new Intl.NumberFormat('en-US').format(stats.bnbMarketCap)}`}
        subValue={`(${new Intl.NumberFormat('en-US').format(stats.bnbSupply)} BNB)`}
      />
      <StatsItem
        icon={<FontAwesomeIcon icon={faGauge} className="text-xl" />}
        title="LATEST BLOCK"
        mainValue={new Intl.NumberFormat('en-US').format(stats.latestBlock)}
        subValue={`(${stats.blockTime}s)`}
      />
      <StatsItem
        title="VOTING POWER"
        mainValue={`${new Intl.NumberFormat('en-US').format(stats.votingPower)} BNB`}
      />
    </div>
  )
} 