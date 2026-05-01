import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Activity, Stethoscope, HeartPulse, Users } from 'lucide-react'
import type { UserRole } from '../types'
import Footer from '../components/common/Footer'

const roles: { role: UserRole; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  {
    role: 'doctor',
    label: 'Doctor',
    desc: 'Full access to all patient vitals, history, and alerts',
    icon: <Stethoscope className="w-6 h-6" />,
    color: 'from-emerald-600 to-emerald-500',
  },
  {
    role: 'nurse',
    label: 'Nurse',
    desc: 'Monitor patients in your ward and manage alerts',
    icon: <HeartPulse className="w-6 h-6" />,
    color: 'from-sky-600 to-sky-500',
  },
  {
    role: 'caregiver',
    label: 'Caregiver',
    desc: 'View assigned patient vitals and receive notifications',
    icon: <Users className="w-6 h-6" />,
    color: 'from-violet-600 to-violet-500',
  },
]

export default function Login() {
  const login = useAuthStore(s => s.login)
  const navigate = useNavigate()

  const handleLogin = (role: UserRole) => {
    login(role)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:48px_48px] opacity-30" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl mb-4 shadow-lg shadow-emerald-500/30">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Smart Health Monitor</h1>
          <p className="text-slate-400 text-sm">IoT-powered real-time patient vitals monitoring</p>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-600">
            <span>● Heart Rate</span>
            <span>● SpO₂</span>
            <span>● Temperature</span>
            <span>● Blood Pressure</span>
          </div>
        </div>

        {/* Role cards */}
        <div className="space-y-3">
          <p className="text-xs text-slate-500 text-center mb-4 uppercase tracking-wider">Select your role to continue</p>
          {roles.map(({ role, label, desc, icon, color }) => (
            <button
              key={role}
              onClick={() => handleLogin(role)}
              className="w-full flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-600 hover:bg-slate-800/60 transition-all group text-left"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md`}>
                {icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-100 group-hover:text-white">{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
              <div className="text-slate-600 group-hover:text-slate-400 transition-colors">→</div>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-slate-700 mt-8">
          Prototype · Demo Data · No real patient information
        </p>
      </div>

      <div className="relative z-10 w-full max-w-md mt-4">
        <Footer centered />
      </div>
    </div>
  )
}
