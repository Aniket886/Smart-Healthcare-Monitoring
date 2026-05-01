import { useAuthStore } from '../store/authStore'
import { THRESHOLDS } from '../utils/thresholds'
import { Shield, Bell, Cpu, Info } from 'lucide-react'

export default function Settings() {
  const user = useAuthStore(s => s.user)

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-400">System configuration and thresholds</p>
      </div>

      {/* Profile */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-white flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-400" /> Profile</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: 'Name',  value: user?.name ?? '—' },
            { label: 'Role',  value: user?.role ?? '—' },
            { label: 'ID',    value: user?.id ?? '—' },
            { label: 'Session', value: 'Active' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-800/50 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-sm text-slate-200 capitalize">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Thresholds */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-white flex items-center gap-2"><Bell className="w-4 h-4 text-amber-400" /> Alert Thresholds</p>
        <p className="text-xs text-slate-500">Values outside warning range trigger alerts. Values outside critical range trigger emergency alerts.</p>
        <div className="space-y-2">
          {[
            { label: 'Heart Rate',       unit: 'bpm',    warn: `${THRESHOLDS.heartRate.warnMin}–${THRESHOLDS.heartRate.warnMax}`,           crit: `<${THRESHOLDS.heartRate.min} or >${THRESHOLDS.heartRate.max}` },
            { label: 'SpO₂',             unit: '%',      warn: `<${THRESHOLDS.spo2.warnMin}`,                                               crit: `<${THRESHOLDS.spo2.min}` },
            { label: 'Temperature',      unit: '°C',     warn: `${THRESHOLDS.temperature.warnMin}–${THRESHOLDS.temperature.warnMax}`,         crit: `<${THRESHOLDS.temperature.min} or >${THRESHOLDS.temperature.max}` },
            { label: 'Blood Pressure',   unit: 'mmHg',   warn: `${THRESHOLDS.bloodPressureSys.warnMin}–${THRESHOLDS.bloodPressureSys.warnMax}`, crit: `<${THRESHOLDS.bloodPressureSys.min} or >${THRESHOLDS.bloodPressureSys.max}` },
            { label: 'Respiratory Rate', unit: 'br/min', warn: `${THRESHOLDS.respiratoryRate.warnMin}–${THRESHOLDS.respiratoryRate.warnMax}`,   crit: `<${THRESHOLDS.respiratoryRate.min} or >${THRESHOLDS.respiratoryRate.max}` },
          ].map(({ label, unit, warn, crit }) => (
            <div key={label} className="grid grid-cols-3 gap-2 text-xs py-2 border-b border-slate-800/50 last:border-0">
              <span className="text-slate-300 font-medium">{label} <span className="text-slate-600">({unit})</span></span>
              <span className="text-amber-400">⚠ {warn}</span>
              <span className="text-red-400">🚨 {crit}</span>
            </div>
          ))}
        </div>
      </section>

      {/* IoT Config */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-white flex items-center gap-2"><Cpu className="w-4 h-4 text-sky-400" /> IoT Configuration (Simulated)</p>
        <div className="space-y-2 text-xs">
          {[
            { label: 'Polling Interval',   value: '5 seconds' },
            { label: 'Protocol',           value: 'MQTT over TLS' },
            { label: 'Broker',             value: 'hospital/patient/{id}/vitals' },
            { label: 'History Window',     value: '60 readings (~5 min)' },
            { label: 'Devices Simulated',  value: '8 ESP32 nodes' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-1.5 border-b border-slate-800/40 last:border-0">
              <span className="text-slate-500">{label}</span>
              <span className="text-slate-300 font-mono">{value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <p className="text-sm font-semibold text-white flex items-center gap-2 mb-2"><Info className="w-4 h-4 text-slate-400" /> About</p>
        <p className="text-xs text-slate-500 leading-relaxed">
          Smart Healthcare Monitoring — IoT Case Study Prototype (BCA, Faculty of Computing &amp; IT).<br />
          Built as a production-ready PWA with simulated ESP32 sensor data, real-time vitals, threshold alerts, and role-based access.<br />
          <span className="text-slate-700">v1.0.0 · 2026</span>
        </p>
      </section>
    </div>
  )
}
