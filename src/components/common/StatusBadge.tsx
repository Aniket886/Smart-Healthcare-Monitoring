import type { VitalStatus } from '../../types'

const cfg: Record<VitalStatus, { label: string; cls: string; dot: string }> = {
  normal:   { label: 'Normal',   cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
  warning:  { label: 'Warning',  cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30',       dot: 'bg-amber-400' },
  critical: { label: 'Critical', cls: 'bg-red-500/15 text-red-400 border-red-500/30',             dot: 'bg-red-400 animate-pulse' },
}

export default function StatusBadge({ status, pulse = false }: { status: VitalStatus; pulse?: boolean }) {
  const { label, cls, dot } = cfg[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} ${pulse && status === 'critical' ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  )
}
