import { create } from 'zustand'
import type { Patient, VitalReading } from '../types'
import { PATIENTS_SEED, seedPatient, nextReading } from '../services/vitalsSimulator'
import { getVitalStatus } from '../utils/thresholds'

const HISTORY_MAX = 60 // keep last 60 readings per patient (~5 min at 5s interval)

interface PatientsState {
  patients: Patient[]
  vitalsHistory: Record<string, VitalReading[]>
  latestVitals: Record<string, VitalReading>
  initialized: boolean
  init: () => void
  tick: () => void
  getPatient: (id: string) => Patient | undefined
}

export const usePatientsStore = create<PatientsState>((set, get) => ({
  patients: [],
  vitalsHistory: {},
  latestVitals: {},
  initialized: false,

  init: () => {
    if (get().initialized) return

    const patients: Patient[] = PATIENTS_SEED.map(p => ({
      ...p,
      status: 'normal',
      isOnline: true,
    }))

    patients.forEach(p => seedPatient(p))

    const vitalsHistory: Record<string, VitalReading[]> = {}
    const latestVitals: Record<string, VitalReading> = {}

    // Pre-fill 30 historical readings per patient
    patients.forEach(p => {
      const history: VitalReading[] = []
      for (let i = 30; i >= 0; i--) {
        const reading = nextReading(p.id)
        reading.timestamp = Date.now() - i * 5000
        history.push(reading)
      }
      vitalsHistory[p.id] = history
      latestVitals[p.id] = history[history.length - 1]
    })

    // Update patient status from initial readings
    const updatedPatients = patients.map(p => ({
      ...p,
      status: getVitalStatus(latestVitals[p.id]),
    }))

    set({ patients: updatedPatients, vitalsHistory, latestVitals, initialized: true })
  },

  tick: () => {
    const { patients, vitalsHistory, latestVitals } = get()
    const newHistory = { ...vitalsHistory }
    const newLatest = { ...latestVitals }

    const updatedPatients = patients.map(p => {
      // 2% chance a device goes offline momentarily
      if (!p.isOnline && Math.random() > 0.3) return { ...p, isOnline: true }
      if (p.isOnline && Math.random() < 0.01) return { ...p, isOnline: false }

      if (!p.isOnline) return p

      const reading = nextReading(p.id)
      const history = [...(newHistory[p.id] ?? []), reading]
      if (history.length > HISTORY_MAX) history.shift()
      newHistory[p.id] = history
      newLatest[p.id] = reading

      return { ...p, status: getVitalStatus(reading) }
    })

    set({ patients: updatedPatients, vitalsHistory: newHistory, latestVitals: newLatest })
  },

  getPatient: (id) => get().patients.find(p => p.id === id),
}))
