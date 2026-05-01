import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, ReferenceLine, CartesianGrid,
} from 'recharts'
import type { VitalReading } from '../../types'
import { THRESHOLDS } from '../../utils/thresholds'
import { formatTime } from '../../utils/formatters'

interface Props {
  history: VitalReading[]
  metric: 'heartRate' | 'spo2' | 'temperature' | 'bloodPressureSys' | 'respiratoryRate'
  color?: string
  label: string
  unit: string
  height?: number
}

const WARN_MAX: Record<Props['metric'], number | undefined> = {
  heartRate:        THRESHOLDS.heartRate.warnMax,
  spo2:             undefined,
  temperature:      THRESHOLDS.temperature.warnMax,
  bloodPressureSys: THRESHOLDS.bloodPressureSys.warnMax,
  respiratoryRate:  THRESHOLDS.respiratoryRate.warnMax,
}
const WARN_MIN: Record<Props['metric'], number | undefined> = {
  heartRate:        THRESHOLDS.heartRate.warnMin,
  spo2:             THRESHOLDS.spo2.warnMin,
  temperature:      THRESHOLDS.temperature.warnMin,
  bloodPressureSys: THRESHOLDS.bloodPressureSys.warnMin,
  respiratoryRate:  THRESHOLDS.respiratoryRate.warnMin,
}

const Y_DOMAIN: Record<Props['metric'], [number, number]> = {
  heartRate:        [30, 160],
  spo2:             [85, 101],
  temperature:      [34, 42],
  bloodPressureSys: [50, 200],
  respiratoryRate:  [5, 35],
}

export default function VitalsChart({ history, metric, color = '#34d399', label, unit, height = 140 }: Props) {
  const data = history.map(r => ({
    time: formatTime(r.timestamp),
    value: r[metric],
    ts: r.timestamp,
  }))

  const warnMax = WARN_MAX[metric]
  const warnMin = WARN_MIN[metric]
  const [yMin, yMax] = Y_DOMAIN[metric]

  return (
    <div>
      <p className="text-xs text-slate-400 mb-1">{label} <span className="text-slate-600">({unit})</span></p>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 9, fill: '#475569' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: 9, fill: '#475569' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#94a3b8' }}
            itemStyle={{ color: color }}
            formatter={(v) => [`${v} ${unit}`, label]}
          />
          {warnMax !== undefined && (
            <ReferenceLine y={warnMax} stroke="#f59e0b" strokeDasharray="4 2" strokeWidth={1} />
          )}
          {warnMin !== undefined && (
            <ReferenceLine y={warnMin} stroke="#f59e0b" strokeDasharray="4 2" strokeWidth={1} />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
