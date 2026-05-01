import { useEffect } from 'react'
import { usePatientsStore } from '../store/patientsStore'
import { useAlertsStore } from '../store/alertsStore'
import { useAuthStore } from '../store/authStore'
import DoctorDashboard   from '../components/dashboard/roles/DoctorDashboard'
import NurseDashboard    from '../components/dashboard/roles/NurseDashboard'
import CaregiverDashboard from '../components/dashboard/roles/CaregiverDashboard'

export default function Dashboard() {
  const user  = useAuthStore(s => s.user)
  const { init, tick } = usePatientsStore()
  const { addAlertsFromReading } = useAlertsStore()

  useEffect(() => { init() }, [init])

  useEffect(() => {
    const id = setInterval(() => {
      tick()
      const state = usePatientsStore.getState()
      state.patients.forEach(p => {
        const v = state.latestVitals[p.id]
        if (v && p.status !== 'normal' && Math.random() < 0.2) {
          addAlertsFromReading(p, v)
        }
      })
    }, 5000)
    return () => clearInterval(id)
  }, [tick, addAlertsFromReading])

  if (user?.role === 'nurse')     return <NurseDashboard />
  if (user?.role === 'caregiver') return <CaregiverDashboard />
  return <DoctorDashboard />
}
