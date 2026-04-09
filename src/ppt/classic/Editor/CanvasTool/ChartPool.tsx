import { Icon } from 'umi'
import type { ChartType } from '@/ppt/core'
import { CHART_TYPE_MAP } from '@/ppt/configs/chart'
import styles from './ChartPool.module.scss'

interface ChartPoolProps {
  onSelect: (chart: ChartType) => void
}

const chartList: ChartType[] = [
  'bar',
  'column',
  'line',
  'area',
  'scatter',
  'pie',
  'ring',
  'radar',
]

const iconMap: Record<ChartType, string> = {
  line: 'lucide:chart-line',
  bar: 'lucide:chart-bar',
  pie: 'lucide:chart-pie',
  column: 'lucide:chart-column',
  area: 'lucide:area-chart',
  ring: 'lucide:donut',
  scatter: 'lucide:chart-scatter',
  radar: 'lucide:radar',
  bubble: 'lucide:bubbles',

}

export default function ChartPool({ onSelect }: ChartPoolProps) {
  return (
    <ul className={styles['chart-pool']}>
      {chartList.map((chart) => (
        <li key={chart} className={styles['chart-item']}>
          <div
            className={styles['chart-content']}
            onClick={() => onSelect(chart)}
          >
            <Icon icon={iconMap[chart] as any} width="24" height="24" />
            <div className={styles.name}>{CHART_TYPE_MAP[chart]}</div>
          </div>
        </li>
      ))}
    </ul>
  )
}
