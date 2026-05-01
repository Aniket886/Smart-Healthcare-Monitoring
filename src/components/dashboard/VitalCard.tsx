import type { VitalStatus } from '../../types'

interface Props {
  label: string
  value: string | number
  unit: string
  icon: string
  status: VitalStatus
  sub?: string
}

const statusRing: Record<VitalStatus, string> = {
  normal:   'ring-emerald-500/20',
  warning:  'ring-amber-500/30',
  critical: 'ring-red-500/40',
}

const statusValue: Record<VitalStatus, string> = {
  normal:   'text-emerald-400',
  warning:  'text-amber-400',
  critical: 'text-red-400',
}

const statusBg: Record<VitalStatus, string> = {
  normal:   'bg-slate-800/60',
  warning:  'bg-amber-950/30',
  critical: 'bg-red-950/30',
}

export default function VitalCard({ label, value, unit, icon, status, sub }: Props) {
  return (
    <div className={`
      ${statusBg[status]} border border-slate-700/50 rounded-xl p-4
      ring-1 ${statusRing[status]}
      ${status === 'critical' ? 'alert-blink' : ''}
      transition-all duration-500
    `}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xl">{icon}</span>
        {status === 'critical' && (
          <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded font-medium animate-pulse">ALERT</span>
        )}
        {status === 'warning' && (
          <span className="text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded font-medium">WARN</span>
        )}
      </div>
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold tabular-nums ${statusValue[status]}`}>{value}</span>
        <span className="text-xs text-slate-500">{unit}</span>
      </div>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}
