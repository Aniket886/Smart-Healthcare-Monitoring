import { Link } from 'react-router-dom'
import { usePatientsStore } from '../../../store/patientsStore'
import { useAlertsStore } from '../../../store/alertsStore'
import { useAuthStore } from '../../../store/authStore'
import VitalCard from '../VitalCard'
import VitalsChart from '../VitalsChart'
import StatusBadge from '../../common/StatusBadge'
import { Users, Bell, CheckCheck, Wifi, WifiOff, Phone } from 'lucide-react'
import { getHeartRateStatus, getSpo2Status, getTempStatus, getBPStatus, getRespStatus } from '../../../utils/thresholds'
import { timeAgo, formatDateTime } from '../../../utils/formatters'

// Caregivers watch a subset of patients (first 2 for demo)
const ASSIGNED_IDS = ['P001', 'P003']

export default function CaregiverDashboard() {
  const user = useAuthStore(s => s.user)
  const { patients, latestVitals, vitalsHistory } = usePatientsStore()
  const { alerts, acknowledge } = useAlertsStore()

  const assigned   = patients.filter(p => ASSIGNED_IDS.includes(p.id))
  const myAlerts   = alerts.filter(a => ASSIGNED_IDS.includes(a.patientId) && !a.acknowledged)

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-violet-500/20 border border-violet-500/30 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Caregiver Dashboard</h1>
          <p className="text-xs text-slate-400">Welcome, {user?.name} · {assigned.length} assigned patient{assigned.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* My alerts */}
      {myAlerts.length > 0 && (
        <div className="bg-red-950/30 border border-red-500/40 rounded-xl p-4">
          <p className="font-semibold text-red-300 flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 animate-pulse" />
            {myAlerts.length} Alert{myAlerts.length !== 1 ? 's' : ''} — Action Needed
          </p>
          <div className="space-y-2">
            {myAlerts.slice(0, 4).map(a => (
              <div key={a.id} className="flex items-center gap-3 bg-slate-900/60 rounded-lg px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200">{a.patientName}</p>
                  <p className="text-xs text-red-300">{a.message}</p>
                  <p className="text-xs text-slate-600">{formatDateTime(a.timestamp)}</p>
                </div>
                <button onClick={() => acknowledge(a.id)} className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300 shrink-0">
                  <CheckCheck className="w-3.5 h-3.5" /> OK
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assigned patients — large vitals cards */}
      {assigned.map(p => {
        const v = latestVitals[p.id]
        const history = vitalsHistory[p.id] ?? []
        return (
          <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            {/* Patient header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-lg font-bold text-white">{p.name}</h2>
                  <StatusBadge status={p.status} pulse />
                  <div className="flex items-center gap-1">
                    {p.isOnline
                      ? <><Wifi className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs text-emerald-400">Live</span></>
                      : <><WifiOff className="w-3.5 h-3.5 text-red-400" /><span className="text-xs text-red-400">Offline</span></>}
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  {p.age} yrs · {p.gender === 'M' ? 'Male' : 'Female'} · {p.ward}, Bed {p.bed} · {p.condition}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 border border-violet-500/30 text-violet-400 rounded-lg text-xs hover:bg-violet-500/20">
                  <Phone className="w-3 h-3" /> Contact Doctor
                </button>
                <Link to={`/patients/${p.id}`} className="text-xs text-slate-400 hover:text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg">
                  Details →
                </Link>
              </div>
            </div>

            {/* Vitals */}
            {v ? (
              <>
                <div>
                  <p className="text-xs text-slate-500 mb-2">Current Vitals · Updated {timeAgo(v.timestamp)}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <VitalCard label="Heart Rate"       value={v.heartRate}        unit="bpm"    icon="❤️"  status={getHeartRateStatus(v.heartRate)} />
                    <VitalCard label="SpO₂"             value={v.spo2}             unit="%"      icon="🫁"  status={getSpo2Status(v.spo2)} />
                    <VitalCard label="Temperature"      value={v.temperature}      unit="°C"     icon="🌡️"  status={getTempStatus(v.temperature)} />
                    <VitalCard label="Blood Pressure"   value={`${v.bloodPressureSys}/${v.bloodPressureDia}`} unit="mmHg" icon="💉" status={getBPStatus(v.bloodPressureSys)} />
                    <VitalCard label="Respiratory Rate" value={v.respiratoryRate}  unit="br/min" icon="🌬️" status={getRespStatus(v.respiratoryRate)} />
                  </div>
                </div>

                {/* Simple heart rate & SpO2 trend */}
                <div>
                  <p className="text-xs text-slate-500 mb-2">Recent Trend</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <VitalsChart history={history} metric="heartRate" color="#f87171" label="Heart Rate" unit="bpm" height={120} />
                    <VitalsChart history={history} metric="spo2"      color="#60a5fa" label="SpO₂"       unit="%"   height={120} />
                  </div>
                </div>
              </>
            ) : (
              <p className="text-slate-500 text-sm text-center py-6">No data available</p>
            )}
          </div>
        )
      })}

      {/* Simple link to alerts */}
      <Link to="/alerts" className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800/50 transition-colors">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-sm font-medium text-slate-200">All Notifications</p>
            <p className="text-xs text-slate-500">View and manage your alerts</p>
          </div>
        </div>
        <span className="text-slate-500">→</span>
      </Link>
    </div>
  )
}
