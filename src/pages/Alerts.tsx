import { useAlertsStore } from '../store/alertsStore'
import { useNavigate } from 'react-router-dom'
import { Bell, BellOff, AlertTriangle, CheckCheck, Trash2 } from 'lucide-react'
import { formatDateTime } from '../utils/formatters'
import type { AlertSeverity } from '../types'

const SEV_CFG: Record<AlertSeverity, { cls: string; icon: string }> = {
  info:     { cls: 'bg-sky-950/40 border-sky-500/30 text-sky-300',       icon: '🔵' },
  warning:  { cls: 'bg-amber-950/30 border-amber-500/30 text-amber-300', icon: '⚠️' },
  critical: { cls: 'bg-red-950/40 border-red-500/40 text-red-300',       icon: '🚨' },
}

export default function Alerts() {
  const { alerts, acknowledge, acknowledgeAll, clearOld } = useAlertsStore()
  const navigate = useNavigate()

  const unack = alerts.filter(a => !a.acknowledged)
  const acked = alerts.filter(a => a.acknowledged)

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-400" />
            Alert Center
          </h1>
          <p className="text-sm text-slate-400">{unack.length} active · {acked.length} acknowledged</p>
        </div>
        <div className="flex gap-2">
          {unack.length > 0 && (
            <button
              onClick={acknowledgeAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs hover:bg-emerald-500/20 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Acknowledge All
            </button>
          )}
          <button
            onClick={clearOld}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-400 rounded-lg text-xs hover:bg-slate-700 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Old
          </button>
        </div>
      </div>

      {/* Active alerts */}
      {unack.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Active ({unack.length})</p>
          <div className="space-y-2">
            {unack.map(alert => {
              const cfg = SEV_CFG[alert.severity]
              return (
                <div key={alert.id} className={`flex items-start gap-3 p-3 border rounded-xl ${cfg.cls}`}>
                  <span className="text-base mt-0.5 flex-shrink-0">{cfg.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        className="font-semibold text-sm hover:underline"
                        onClick={() => navigate(`/patients/${alert.patientId}`)}
                      >
                        {alert.patientName}
                      </button>
                      <span className="text-xs bg-slate-900/50 px-1.5 py-0.5 rounded font-medium uppercase">
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-sm mt-0.5">{alert.message}</p>
                    <p className="text-xs text-slate-500 mt-1">{formatDateTime(alert.timestamp)} · {alert.type.replace('_', ' ')}</p>
                  </div>
                  <button
                    onClick={() => acknowledge(alert.id)}
                    title="Acknowledge"
                    className="text-slate-500 hover:text-slate-300 flex-shrink-0 mt-0.5"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Acknowledged */}
      {acked.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Acknowledged ({acked.length})</p>
          <div className="space-y-1.5">
            {acked.slice(0, 30).map(alert => (
              <div
                key={alert.id}
                className="flex items-center gap-3 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg opacity-50"
              >
                <BellOff className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-slate-400 font-medium">{alert.patientName}</span>
                  <span className="text-xs text-slate-600 mx-2">·</span>
                  <span className="text-xs text-slate-500">{alert.message}</span>
                </div>
                <span className="text-xs text-slate-700">{formatDateTime(alert.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <AlertTriangle className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-sm">No alerts yet. System is monitoring all patients.</p>
        </div>
      )}
    </div>
  )
}
