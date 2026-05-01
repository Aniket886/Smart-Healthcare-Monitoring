import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePatientsStore } from '../store/patientsStore'
import { useAlertsStore } from '../store/alertsStore'
import { useAuthStore } from '../store/authStore'
import VitalCard from '../components/dashboard/VitalCard'
import StatusBadge from '../components/common/StatusBadge'
import { Activity, AlertTriangle, Users, Wifi, Clock } from 'lucide-react'
import {
  getHeartRateStatus, getSpo2Status, getTempStatus, getBPStatus, getRespStatus,
} from '../utils/thresholds'
import { formatDateTime, timeAgo } from '../utils/formatters'

export default function Dashboard() {
  const user = useAuthStore(s => s.user)
  const { patients, latestVitals, init, tick } = usePatientsStore()
  const { alerts, addAlertsFromReading } = useAlertsStore()

  useEffect(() => {
    init()
  }, [init])

  // Tick every 5 seconds
  useEffect(() => {
    const id = setInterval(() => {
      tick()
      // After tick, generate alerts for critical patients
      const state = usePatientsStore.getState()
      state.patients.forEach(p => {
        const v = state.latestVitals[p.id]
        if (v && (p.status === 'critical' || p.status === 'warning')) {
          // Throttle: only generate alerts ~20% of the time per tick
          if (Math.random() < 0.2) addAlertsFromReading(p, v)
        }
      })
    }, 5000)
    return () => clearInterval(id)
  }, [tick, addAlertsFromReading])

  const critical = patients.filter(p => p.status === 'critical')
  const warning  = patients.filter(p => p.status === 'warning')
  const offline  = patients.filter(p => !p.isOnline)
  const recentAlerts = alerts.filter(a => !a.acknowledged).slice(0, 5)

  // Pick the "focus" patient — first critical, else first warning
  const focusPatient = critical[0] ?? warning[0] ?? patients[0]
  const focusVitals = focusPatient ? latestVitals[focusPatient.id] : undefined

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400">Welcome back, {user?.name} · <span className="text-emerald-400">Live</span></p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Patients', value: patients.length, icon: <Users className="w-4 h-4" />, cls: 'text-slate-300', bg: 'bg-slate-800/60' },
          { label: 'Critical',       value: critical.length,  icon: <AlertTriangle className="w-4 h-4" />, cls: 'text-red-400',     bg: critical.length > 0 ? 'bg-red-950/40' : 'bg-slate-800/60' },
          { label: 'Warning',        value: warning.length,   icon: <Activity className="w-4 h-4" />,      cls: 'text-amber-400',   bg: warning.length > 0  ? 'bg-amber-950/30' : 'bg-slate-800/60' },
          { label: 'Devices Online', value: `${patients.length - offline.length}/${patients.length}`, icon: <Wifi className="w-4 h-4" />, cls: 'text-emerald-400', bg: 'bg-slate-800/60' },
        ].map(({ label, value, icon, cls, bg }) => (
          <div key={label} className={`${bg} border border-slate-700/50 rounded-xl p-4`}>
            <div className={`${cls} mb-2`}>{icon}</div>
            <p className={`text-2xl font-bold ${cls}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Focus vitals + recent alerts */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Focus patient vitals */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4">
          {focusPatient && focusVitals ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{focusPatient.name}</p>
                    <StatusBadge status={focusPatient.status} pulse />
                  </div>
                  <p className="text-xs text-slate-500">{focusPatient.ward} · Bed {focusPatient.bed} · {focusPatient.condition}</p>
                </div>
                <Link to={`/patients/${focusPatient.id}`} className="text-xs text-emerald-400 hover:text-emerald-300">
                  View detail →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <VitalCard label="Heart Rate"       value={focusVitals.heartRate}        unit="bpm"   icon="❤️"  status={getHeartRateStatus(focusVitals.heartRate)} />
                <VitalCard label="SpO₂"             value={focusVitals.spo2}             unit="%"     icon="🫁"  status={getSpo2Status(focusVitals.spo2)} />
                <VitalCard label="Temperature"      value={focusVitals.temperature}      unit="°C"    icon="🌡️"  status={getTempStatus(focusVitals.temperature)} />
                <VitalCard label="Blood Pressure"   value={`${focusVitals.bloodPressureSys}/${focusVitals.bloodPressureDia}`} unit="mmHg" icon="💉" status={getBPStatus(focusVitals.bloodPressureSys)} />
                <VitalCard label="Respiratory Rate" value={focusVitals.respiratoryRate}  unit="br/min" icon="🌬️" status={getRespStatus(focusVitals.respiratoryRate)} />
                <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4 flex flex-col justify-between">
                  <p className="text-xs text-slate-400">Device</p>
                  <p className="text-sm font-mono text-slate-300">{focusPatient.deviceId}</p>
                  <p className="text-xs text-slate-500 mt-1">Updated {timeAgo(focusVitals.timestamp)}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-500">Loading vitals…</div>
          )}
        </div>

        {/* Recent alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-white text-sm">Active Alerts</p>
            <Link to="/alerts" className="text-xs text-emerald-400 hover:text-emerald-300">All alerts →</Link>
          </div>
          {recentAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-500">
              <Activity className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-xs">No active alerts</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentAlerts.map(a => (
                <div
                  key={a.id}
                  className={`p-2.5 rounded-lg border text-xs ${
                    a.severity === 'critical'
                      ? 'bg-red-950/40 border-red-500/30 text-red-300'
                      : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                  }`}
                >
                  <p className="font-medium">{a.patientName}</p>
                  <p className="text-slate-400 mt-0.5">{a.message}</p>
                  <p className="text-slate-600 mt-1">{formatDateTime(a.timestamp)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Patient overview table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <p className="font-semibold text-white text-sm">All Patients</p>
          <Link to="/patients" className="text-xs text-emerald-400 hover:text-emerald-300">Manage →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/50">
                {['Patient', 'Ward', 'Heart Rate', 'SpO₂', 'Temp', 'Status'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patients.map(p => {
                const v = latestVitals[p.id]
                return (
                  <tr
                    key={p.id}
                    className="border-b border-slate-800/30 hover:bg-slate-800/30 cursor-pointer"
                    onClick={() => window.location.href = `/patients/${p.id}`}
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-200">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.id}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{p.ward} / {p.bed}</td>
                    <td className={`px-4 py-3 text-sm font-mono font-semibold ${v ? getHeartRateStatus(v.heartRate) === 'critical' ? 'text-red-400' : getHeartRateStatus(v.heartRate) === 'warning' ? 'text-amber-400' : 'text-emerald-400' : 'text-slate-600'}`}>
                      {v ? `${v.heartRate}` : '—'}
                    </td>
                    <td className={`px-4 py-3 text-sm font-mono font-semibold ${v ? getSpo2Status(v.spo2) === 'critical' ? 'text-red-400' : getSpo2Status(v.spo2) === 'warning' ? 'text-amber-400' : 'text-emerald-400' : 'text-slate-600'}`}>
                      {v ? `${v.spo2}%` : '—'}
                    </td>
                    <td className={`px-4 py-3 text-sm font-mono font-semibold ${v ? getTempStatus(v.temperature) === 'critical' ? 'text-red-400' : getTempStatus(v.temperature) === 'warning' ? 'text-amber-400' : 'text-emerald-400' : 'text-slate-600'}`}>
                      {v ? `${v.temperature}°` : '—'}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} pulse /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
