import { useState } from 'react'
import { usePatientsStore } from '../store/patientsStore'
import PatientRow from '../components/patients/PatientRow'
import { Search, Filter } from 'lucide-react'
import type { VitalStatus } from '../types'

export default function Patients() {
  const patients = usePatientsStore(s => s.patients)
  const latestVitals = usePatientsStore(s => s.latestVitals)
  const [query, setQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<VitalStatus | 'all'>('all')

  const filtered = patients.filter(p => {
    const matchQ = query === '' || p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.id.toLowerCase().includes(query.toLowerCase()) || p.ward.toLowerCase().includes(query.toLowerCase())
    const matchS = filterStatus === 'all' || p.status === filterStatus
    return matchQ && matchS
  })

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Patients</h1>
          <p className="text-sm text-slate-400">{patients.length} patients monitored</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, ID, ward…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          {(['all', 'normal', 'warning', 'critical'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === s
                  ? s === 'critical' ? 'bg-red-500 text-white'
                    : s === 'warning' ? 'bg-amber-500 text-white'
                    : s === 'normal' ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-900'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {s !== 'all' && (
                <span className="ml-1 opacity-70">
                  ({patients.filter(p => p.status === s).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {['Patient', 'Ward / Bed', 'Condition', 'Latest Vitals', 'Status', 'Device', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500 text-sm">
                    No patients match the filter.
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <PatientRow key={p.id} patient={p} latest={latestVitals[p.id]} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
