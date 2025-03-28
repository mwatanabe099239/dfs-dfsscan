'use client'

import { useEffect, useState } from 'react'
import { NetworkStats } from '../../types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faList,
  faClock,
  faCube
} from '@fortawesome/free-solid-svg-icons'
import { getNetworkStats } from '../../lib/firebase'

interface StatsItemProps {
  icon: React.ReactNode
  label: string
  mainValue: string
  subValue?: string
}

const StatsItem = ({ icon, label, mainValue, subValue }: StatsItemProps) => (
  <div className='flex gap-2 items-start pl-2'>
    <div className="flex items-center gap-1.5 mb-0.5">
      <div className="text-gray-600 text-2xl w-6">
        {icon}
      </div>
    </div>
    <div className='flex flex-col gap-0.5'>
      <div className="uppercase text-sm text-gray-600">
        {label}
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-base">{mainValue}</span>
        {subValue && <span className="text-sm text-gray-600">({subValue})</span>}
      </div>
    </div>
    
  </div>
)

export default function NetworkStatsSection({ stats }: { stats: NetworkStats }) {
  const [networkStats, setNetworkStats] = useState({
    latestBlock: 0,
    totalTransactions: 0,
    baseFee: "1"
  });

  useEffect(() => {
    const fetchStats = async () => {
      const stats = await getNetworkStats();
      setNetworkStats(stats);
    };
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:gap-0 py-0 ">
      <div className="w-full md:w-1/3 flex items-center border-b md:border-b-0 md:border-r border-gray-200">
        <StatsItem
          icon={<FontAwesomeIcon icon={faList} />}
          label="Transactions"
          mainValue={networkStats.totalTransactions.toLocaleString()}
        />
      </div>
      <div className="w-full md:w-1/3 flex items-center px-2 border-b md:border-b-0 md:border-r border-gray-200">
        <StatsItem
          icon={<FontAwesomeIcon icon={faClock} />}
          label="Base Fee"
          mainValue={`${networkStats.baseFee} DFS`}
        />
      </div>
      <div className="w-full md:w-1/3 flex items-center pl-2">
        <StatsItem
          icon={<FontAwesomeIcon icon={faCube} />}
          label="Latest Block"
          mainValue={networkStats.latestBlock.toString()}
        />
      </div>
    </div>
  )
} 