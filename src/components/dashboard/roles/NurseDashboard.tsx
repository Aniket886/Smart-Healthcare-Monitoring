import { Link } from 'react-router-dom'
import { usePatientsStore } from '../../../store/patientsStore'
import { useAlertsStore } from '../../../store/alertsStore'
import { useAuthStore } from '../../../store/authStore'
import VitalCard from '../VitalCard'
import StatusBadge from '../../common/StatusBadge'
import {
  Bell, CheckCheck, Clock, HeartPulse, Wifi, WifiOff, AlertTriangle,
} from 'lucide-react'
import { getHeartRateStatus, getSpo2Status, getTempStatus, getBPStatus } from '../../../utils/thresholds'
import { timeAgo, formatDateTime } from '../../../utils/formatters'

export default function NurseDashboard() {
  const user = useAuthStore(s => s.user)
  const { patients, latestVitals } = usePatientsStore()
  const { alerts, acknowledge, acknowledgeAll } = useAlertsStore()

  const critical   = patients.filter(p => p.status === 'critical')
  const warning    = patients.filter(p => p.status === 'warning')
  const unackAlerts = alerts.filter(a => !a.acknowledged)
  const critAlerts  = unackAlerts.filter(a => a.severity === 'critical')
  const warnAlerts  = unackAlerts.filter(a => a.severity === 'warning')

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-sky-500/20 border border-sky-500/30 rounded-lg flex items-center justify-center">
            <HeartPulse className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Nurse Dashboard</h1>
            <p className="text-xs text-slate-400">Welcome, {user?.name} · Active monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} — Current Shift
        </div>
      </div>

      {/* Quick status strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`rounded-xl p-3 border text-center ${critAlerts.length > 0 ? 'bg-red-950/40 border-red-500/40' : 'bg-slate-800/60 border-slate-700/50'}`}>
          <p className={`text-2xl font-bold ${critAlerts.length > 0 ? 'text-red-400' : 'text-slate-300'}`}>{critAlerts.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Critical Alerts</p>
        </div>
        <div className={`rounded-xl p-3 border text-center ${warnAlerts.length > 0 ? 'bg-amber-950/30 border-amber-500/30' : 'bg-slate-800/60 border-slate-700/50'}`}>
          <p className={`text-2xl font-bold ${warnAlerts.length > 0 ? 'text-amber-400' : 'text-slate-300'}`}>{warnAlerts.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Warnings</p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-slate-300">{patients.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Patients</p>
        </div>
      </div>

      {/* Active alerts — most prominent section for nurse */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-red-400" />
            Active Alerts
            {unackAlerts.length > 0 && (
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                {unackAlerts.length}
              </span>
            )}
          </p>
          {unackAlerts.length > 0 && (
            <button
              onClick={acknowledgeAll}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-500/20"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Ack All
            </button>
          )}
        </div>

        {unackAlerts.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-slate-500">
            <CheckCheck className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">All clear — no active alerts</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {unackAlerts.map(a => (
              <div key={a.id} className={`flex items-start gap-3 p-3 rounded-lg border ${a.severity === 'critical' ? 'bg-red-950/40 border-red-500/30' : 'bg-amber-950/30 border-amber-500/30'}`}>
                <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${a.severity === 'critical' ? 'text-red-400' : 'text-amber-400'}`} />
                <div className="flex-1 min-w-0">
                  <Link to={`/patients/${a.patientId}`} className="text-sm font-semibold text-slate-200 hover:text-white">{a.patientName}</Link>
                  <p className={`text-xs mt-0.5 ${a.severity === 'critical' ? 'text-red-300' : 'text-amber-300'}`}>{a.message}</p>
                  <p className="text-xs text-slate-600 mt-1">{formatDateTime(a.timestamp)}</p>
                </div>
                <button onClick={() => acknowledge(a.id)} className="text-slate-500 hover:text-emerald-400 shrink-0">
                  <CheckCheck className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Critical & warning patients — vitals at a glance */}
      {(critical.length > 0 || warning.length > 0) && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="font-semibold text-white text-sm mb-3">Patients Needing Attention</p>
          <div className="space-y-4">
            {[...critical, ...warning].slice(0, 4).map(p => {
              const v = latestVitals[p.id]
              return (
                <div key={p.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Link to={`/patients/${p.id}`} className="text-sm font-medium text-slate-200 hover:text-white">{p.name}</Link>
                      <StatusBadge status={p.status} pulse />
                      <span className="text-xs text-slate-500">{p.ward} · {p.bed}</span>
                    </div>
                    {v && <span className="text-xs text-slate-600">{timeAgo(v.timestamp)}</span>}
                  </div>
                  {v && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <VitalCard label="Heart Rate" value={v.heartRate}        unit="bpm"  icon="❤️"  status={getHeartRateStatus(v.heartRate)} />
                      <VitalCard label="SpO₂"       value={v.spo2}            unit="%"    icon="🫁"  status={getSpo2Status(v.spo2)} />
                      <VitalCard label="Temp"        value={v.temperature}     unit="°C"   icon="🌡️"  status={getTempStatus(v.temperature)} />
                      <VitalCard label="BP"          value={`${v.bloodPressureSys}/${v.bloodPressureDia}`} unit="mmHg" icon="💉" status={getBPStatus(v.bloodPressureSys)} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Full patient roster */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <p className="font-semibold text-white text-sm">Patient Roster</p>
          <Link to="/patients" className="text-xs text-sky-400 hover:text-sky-300">View all →</Link>
        </div>
        <div className="divide-y divide-slate-800/50">
          {patients.map(p => {
            const v = latestVitals[p.id]
            return (
              <Link key={p.id} to={`/patients/${p.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                  {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.ward} · Bed {p.bed}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {v && <span className="text-xs font-mono text-slate-400 hidden sm:block">❤ {v.heartRate} · O₂ {v.spo2}%</span>}
                  <StatusBadge status={p.status} pulse />
                  {p.isOnline
                    ? <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    : <WifiOff className="w-3.5 h-3.5 text-red-400" />}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
