import { useNavigate } from 'react-router-dom'
import type { Patient, VitalReading } from '../../types'
import StatusBadge from '../common/StatusBadge'
import { Wifi, WifiOff, ChevronRight } from 'lucide-react'

interface Props {
  patient: Patient
  latest?: VitalReading
}

export default function PatientRow({ patient, latest }: Props) {
  const navigate = useNavigate()

  return (
    <tr
      className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer transition-colors"
      onClick={() => navigate(`/patients/${patient.id}`)}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
            {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">{patient.name}</p>
            <p className="text-xs text-slate-500">{patient.id} · {patient.gender === 'M' ? 'Male' : 'Female'} · {patient.age}y</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-400">
        <p>{patient.ward}</p>
        <p className="text-xs text-slate-600">Bed {patient.bed}</p>
      </td>
      <td className="px-4 py-3 text-xs text-slate-400">{patient.condition}</td>
      <td className="px-4 py-3">
        {latest ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-slate-300 tabular-nums">❤ {latest.heartRate} bpm</span>
            <span className="text-xs text-slate-500 tabular-nums">O₂ {latest.spo2}%</span>
          </div>
        ) : <span className="text-xs text-slate-600">—</span>}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={patient.status} pulse />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          {patient.isOnline
            ? <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            : <WifiOff className="w-3.5 h-3.5 text-red-400" />}
          <span className={`text-xs ${patient.isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
            {patient.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-slate-600">
        <ChevronRight className="w-4 h-4" />
      </td>
    </tr>
  )
}
