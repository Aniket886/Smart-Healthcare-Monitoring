import { Link } from 'react-router-dom'
import { usePatientsStore } from '../../../store/patientsStore'
import { useAlertsStore } from '../../../store/alertsStore'
import { useAuthStore } from '../../../store/authStore'
import VitalCard from '../VitalCard'
import VitalsChart from '../VitalsChart'
import StatusBadge from '../../common/StatusBadge'
import {
  Activity, AlertTriangle, Users, Wifi, Clock,
  TrendingUp, ShieldAlert, Stethoscope,
} from 'lucide-react'
import {
  getHeartRateStatus, getSpo2Status, getTempStatus, getBPStatus, getRespStatus,
} from '../../../utils/thresholds'
import { formatDateTime, timeAgo } from '../../../utils/formatters'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

export default function DoctorDashboard() {
  const user = useAuthStore(s => s.user)
  const { patients, latestVitals, vitalsHistory } = usePatientsStore()
  const { alerts } = useAlertsStore()

  const critical = patients.filter(p => p.status === 'critical')
  const warning  = patients.filter(p => p.status === 'warning')
  const normal   = patients.filter(p => p.status === 'normal')
  const offline  = patients.filter(p => !p.isOnline)
  const unackAlerts = alerts.filter(a => !a.acknowledged)
  const focusPatient = critical[0] ?? warning[0] ?? patients[0]
  const focusVitals  = focusPatient ? latestVitals[focusPatient.id] : undefined
  const focusHistory = focusPatient ? vitalsHistory[focusPatient.id] ?? [] : []

  const pieData = [
    { name: 'Critical', value: critical.length, color: '#ef4444' },
    { name: 'Warning',  value: warning.length,  color: '#f59e0b' },
    { name: 'Normal',   value: normal.length,   color: '#10b981' },
  ].filter(d => d.value > 0)

  // Ward breakdown
  const wards = [...new Set(patients.map(p => p.ward))]
  const wardStats = wards.map(w => ({
    name: w,
    total: patients.filter(p => p.ward === w).length,
    critical: patients.filter(p => p.ward === w && p.status === 'critical').length,
  }))

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Doctor Dashboard</h1>
            <p className="text-xs text-slate-400">Welcome, {user?.name} · Full clinical access</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <Users className="w-4 h-4 text-slate-400 mb-2" />
          <p className="text-2xl font-bold text-white">{patients.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Patients</p>
        </div>
        <div className={`border rounded-xl p-4 ${critical.length > 0 ? 'bg-red-950/40 border-red-500/30' : 'bg-slate-800/60 border-slate-700/50'}`}>
          <AlertTriangle className={`w-4 h-4 mb-2 ${critical.length > 0 ? 'text-red-400' : 'text-slate-400'}`} />
          <p className={`text-2xl font-bold ${critical.length > 0 ? 'text-red-400' : 'text-white'}`}>{critical.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Critical</p>
        </div>
        <div className={`border rounded-xl p-4 ${warning.length > 0 ? 'bg-amber-950/30 border-amber-500/30' : 'bg-slate-800/60 border-slate-700/50'}`}>
          <Activity className={`w-4 h-4 mb-2 ${warning.length > 0 ? 'text-amber-400' : 'text-slate-400'}`} />
          <p className={`text-2xl font-bold ${warning.length > 0 ? 'text-amber-400' : 'text-white'}`}>{warning.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Warning</p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <Wifi className="w-4 h-4 text-emerald-400 mb-2" />
          <p className="text-2xl font-bold text-emerald-400">{patients.length - offline.length}/{patients.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Devices Online</p>
        </div>
      </div>

      {/* Focus vitals + Patient distribution */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Focus patient */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Priority Patient</p>
              {focusPatient && (
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white">{focusPatient.name}</p>
                  <StatusBadge status={focusPatient.status} pulse />
                </div>
              )}
              <p className="text-xs text-slate-500">{focusPatient?.ward} · Bed {focusPatient?.bed} · {focusPatient?.condition}</p>
            </div>
            {focusPatient && (
              <Link to={`/patients/${focusPatient.id}`} className="text-xs text-emerald-400 hover:text-emerald-300 shrink-0">
                Full detail →
              </Link>
            )}
          </div>
          {focusVitals ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <VitalCard label="Heart Rate"       value={focusVitals.heartRate}       unit="bpm"    icon="❤️"  status={getHeartRateStatus(focusVitals.heartRate)} />
              <VitalCard label="SpO₂"             value={focusVitals.spo2}            unit="%"      icon="🫁"  status={getSpo2Status(focusVitals.spo2)} />
              <VitalCard label="Temperature"      value={focusVitals.temperature}     unit="°C"     icon="🌡️"  status={getTempStatus(focusVitals.temperature)} />
              <VitalCard label="Blood Pressure"   value={`${focusVitals.bloodPressureSys}/${focusVitals.bloodPressureDia}`} unit="mmHg" icon="💉" status={getBPStatus(focusVitals.bloodPressureSys)} />
              <VitalCard label="Respiratory Rate" value={focusVitals.respiratoryRate} unit="br/min" icon="🌬️" status={getRespStatus(focusVitals.respiratoryRate)} />
              <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4 flex flex-col justify-between">
                <p className="text-xs text-slate-500">Last update</p>
                <p className="text-sm font-mono text-slate-300">{focusPatient?.deviceId}</p>
                <p className="text-xs text-emerald-400 mt-1">{timeAgo(focusVitals.timestamp)}</p>
              </div>
            </div>
          ) : <p className="text-slate-500 text-sm py-6 text-center">Loading…</p>}
        </div>

        {/* Patient status pie + ward breakdown */}
        <div className="space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" />Status Distribution</p>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={3}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', fontSize: 11, borderRadius: 6 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-1">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-1 text-xs">
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-slate-400">{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" />Ward Overview</p>
            <div className="space-y-2">
              {wardStats.map(w => (
                <div key={w.name} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 truncate flex-1">{w.name}</span>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-slate-500">{w.total} pts</span>
                    {w.critical > 0 && <span className="text-red-400 font-medium">{w.critical} crit</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vitals trend of focus patient */}
      {focusHistory.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-sm font-semibold text-white mb-4">Priority Patient — Vitals Trend</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <VitalsChart history={focusHistory} metric="heartRate"        color="#f87171" label="Heart Rate"       unit="bpm"    />
            <VitalsChart history={focusHistory} metric="spo2"             color="#60a5fa" label="SpO₂"             unit="%"      />
            <VitalsChart history={focusHistory} metric="temperature"      color="#fb923c" label="Temperature"      unit="°C"     />
            <VitalsChart history={focusHistory} metric="bloodPressureSys" color="#a78bfa" label="Blood Pressure"   unit="mmHg"   />
            <VitalsChart history={focusHistory} metric="respiratoryRate"  color="#34d399" label="Respiratory Rate" unit="br/min" />
          </div>
        </div>
      )}

      {/* All patients table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <p className="font-semibold text-white text-sm">All Patients</p>
          <Link to="/patients" className="text-xs text-emerald-400 hover:text-emerald-300">Manage all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/50">
                {['Patient', 'Ward / Bed', 'Condition', 'HR', 'SpO₂', 'Temp', 'BP', 'Status'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patients.map(p => {
                const v = latestVitals[p.id]
                return (
                  <tr key={p.id} className="border-b border-slate-800/30 hover:bg-slate-800/30 cursor-pointer" onClick={() => window.location.href = `/patients/${p.id}`}>
                    <td className="px-4 py-2.5">
                      <p className="text-sm text-slate-200 font-medium">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.id}</p>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-400">{p.ward} / {p.bed}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-400 max-w-[120px] truncate">{p.condition}</td>
                    <td className={`px-4 py-2.5 text-xs font-mono font-semibold ${v ? getHeartRateStatus(v.heartRate) === 'critical' ? 'text-red-400' : getHeartRateStatus(v.heartRate) === 'warning' ? 'text-amber-400' : 'text-emerald-400' : 'text-slate-600'}`}>{v ? `${v.heartRate}` : '—'}</td>
                    <td className={`px-4 py-2.5 text-xs font-mono font-semibold ${v ? getSpo2Status(v.spo2) === 'critical' ? 'text-red-400' : getSpo2Status(v.spo2) === 'warning' ? 'text-amber-400' : 'text-emerald-400' : 'text-slate-600'}`}>{v ? `${v.spo2}%` : '—'}</td>
                    <td className={`px-4 py-2.5 text-xs font-mono font-semibold ${v ? getTempStatus(v.temperature) === 'critical' ? 'text-red-400' : getTempStatus(v.temperature) === 'warning' ? 'text-amber-400' : 'text-emerald-400' : 'text-slate-600'}`}>{v ? `${v.temperature}°` : '—'}</td>
                    <td className={`px-4 py-2.5 text-xs font-mono font-semibold ${v ? getBPStatus(v.bloodPressureSys) === 'critical' ? 'text-red-400' : getBPStatus(v.bloodPressureSys) === 'warning' ? 'text-amber-400' : 'text-emerald-400' : 'text-slate-600'}`}>{v ? `${v.bloodPressureSys}/${v.bloodPressureDia}` : '—'}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={p.status} pulse /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent alerts */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-white text-sm">Recent Alerts ({unackAlerts.length} active)</p>
          <Link to="/alerts" className="text-xs text-emerald-400 hover:text-emerald-300">View all →</Link>
        </div>
        {unackAlerts.length === 0
          ? <p className="text-xs text-slate-500 py-4 text-center">No active alerts</p>
          : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {unackAlerts.slice(0, 6).map(a => (
                <div key={a.id} className={`p-2.5 rounded-lg border text-xs ${a.severity === 'critical' ? 'bg-red-950/40 border-red-500/30 text-red-300' : 'bg-amber-950/30 border-amber-500/30 text-amber-300'}`}>
                  <p className="font-semibold">{a.patientName}</p>
                  <p className="text-slate-400 mt-0.5 truncate">{a.message}</p>
                  <p className="text-slate-600 mt-1">{formatDateTime(a.timestamp)}</p>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  )
}
