import { useParams, useNavigate } from 'react-router-dom'
import { usePatientsStore } from '../store/patientsStore'
import VitalCard from '../components/dashboard/VitalCard'
import VitalsChart from '../components/dashboard/VitalsChart'
import StatusBadge from '../components/common/StatusBadge'
import { ArrowLeft, Wifi, WifiOff, Calendar, Cpu } from 'lucide-react'
import {
  getHeartRateStatus, getSpo2Status, getTempStatus, getBPStatus, getRespStatus,
} from '../utils/thresholds'
import { formatDateTime, timeAgo } from '../utils/formatters'

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const patient  = usePatientsStore(s => s.patients.find(p => p.id === id))
  const vitals   = usePatientsStore(s => id ? s.latestVitals[id] : undefined)
  const history  = usePatientsStore(s => id ? s.vitalsHistory[id] ?? [] : [])

  if (!patient) {
    return (
      <div className="p-6 text-center text-slate-400">
        Patient not found. <button className="text-emerald-400" onClick={() => navigate(-1)}>Go back</button>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-200 mt-0.5">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white">{patient.name}</h1>
            <StatusBadge status={patient.status} pulse />
            {patient.isOnline
              ? <span className="flex items-center gap-1 text-xs text-emerald-400"><Wifi className="w-3 h-3" /> Online</span>
              : <span className="flex items-center gap-1 text-xs text-red-400"><WifiOff className="w-3 h-3" /> Offline</span>}
          </div>
          <p className="text-sm text-slate-400">
            {patient.id} · {patient.gender === 'M' ? 'Male' : 'Female'}, {patient.age} yrs ·{' '}
            {patient.ward}, Bed {patient.bed}
          </p>
        </div>
      </div>

      {/* Patient info cards */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <p className="text-xs text-slate-500 mb-1">Diagnosis</p>
          <p className="text-sm font-medium text-slate-200">{patient.condition}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <div>
            <p className="text-xs text-slate-500">Admitted</p>
            <p className="text-sm font-medium text-slate-200">{patient.admittedOn}</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-slate-500" />
          <div>
            <p className="text-xs text-slate-500">Device ID</p>
            <p className="text-sm font-mono text-slate-200">{patient.deviceId}</p>
          </div>
        </div>
      </div>

      {/* Live vitals */}
      {vitals ? (
        <>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
              Live Vitals · Updated {timeAgo(vitals.timestamp)}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <VitalCard label="Heart Rate"       value={vitals.heartRate}        unit="bpm"    icon="❤️"  status={getHeartRateStatus(vitals.heartRate)} />
              <VitalCard label="SpO₂"             value={vitals.spo2}             unit="%"      icon="🫁"  status={getSpo2Status(vitals.spo2)} />
              <VitalCard label="Temperature"      value={vitals.temperature}      unit="°C"     icon="🌡️"  status={getTempStatus(vitals.temperature)} />
              <VitalCard label="Blood Pressure"   value={`${vitals.bloodPressureSys}/${vitals.bloodPressureDia}`} unit="mmHg" icon="💉" status={getBPStatus(vitals.bloodPressureSys)} />
              <VitalCard label="Respiratory Rate" value={vitals.respiratoryRate}  unit="br/min" icon="🌬️" status={getRespStatus(vitals.respiratoryRate)} />
            </div>
          </div>

          {/* Charts */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-sm font-semibold text-white mb-4">Vitals Trend (last 5 min)</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <VitalsChart history={history} metric="heartRate"        color="#f87171" label="Heart Rate"       unit="bpm"    />
              <VitalsChart history={history} metric="spo2"             color="#60a5fa" label="SpO₂"             unit="%"      />
              <VitalsChart history={history} metric="temperature"      color="#fb923c" label="Temperature"      unit="°C"     />
              <VitalsChart history={history} metric="bloodPressureSys" color="#a78bfa" label="Blood Pressure"   unit="mmHg"   />
              <VitalsChart history={history} metric="respiratoryRate"  color="#34d399" label="Respiratory Rate" unit="br/min" />
            </div>
          </div>

          {/* Latest readings table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800">
              <p className="text-sm font-semibold text-white">Recent Readings</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800">
                    {['Time', 'Heart Rate', 'SpO₂', 'Temp', 'BP (Sys/Dia)', 'Resp Rate'].map(h => (
                      <th key={h} className="px-4 py-2 text-left text-slate-500 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...history].reverse().slice(0, 15).map((r, i) => (
                    <tr key={i} className="border-b border-slate-800/30 hover:bg-slate-800/20">
                      <td className="px-4 py-2 text-slate-500 tabular-nums">{formatDateTime(r.timestamp)}</td>
                      <td className={`px-4 py-2 font-mono font-semibold tabular-nums ${getHeartRateStatus(r.heartRate) === 'critical' ? 'text-red-400' : getHeartRateStatus(r.heartRate) === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>{r.heartRate} bpm</td>
                      <td className={`px-4 py-2 font-mono font-semibold tabular-nums ${getSpo2Status(r.spo2) === 'critical' ? 'text-red-400' : getSpo2Status(r.spo2) === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>{r.spo2}%</td>
                      <td className={`px-4 py-2 font-mono font-semibold tabular-nums ${getTempStatus(r.temperature) === 'critical' ? 'text-red-400' : getTempStatus(r.temperature) === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>{r.temperature}°C</td>
                      <td className={`px-4 py-2 font-mono font-semibold tabular-nums ${getBPStatus(r.bloodPressureSys) === 'critical' ? 'text-red-400' : getBPStatus(r.bloodPressureSys) === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>{r.bloodPressureSys}/{r.bloodPressureDia}</td>
                      <td className={`px-4 py-2 font-mono font-semibold tabular-nums ${getRespStatus(r.respiratoryRate) === 'critical' ? 'text-red-400' : getRespStatus(r.respiratoryRate) === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>{r.respiratoryRate} br/min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-slate-500 py-16">No vitals data available for this patient.</div>
      )}
    </div>
  )
}
