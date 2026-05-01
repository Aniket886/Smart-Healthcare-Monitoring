import type { Patient, VitalReading } from '../types'

// Seed state per patient so readings drift realistically
const state: Record<string, { hr: number; spo2: number; temp: number; bpSys: number; bpDia: number; rr: number }> = {}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function drift(current: number, target: number, noise: number, speed = 0.15): number {
  return current + (target - current) * speed + (Math.random() - 0.5) * noise
}

// Each patient gets a "baseline" personality
const baselines: Record<string, { hr: number; spo2: number; temp: number; bpSys: number; bpDia: number; rr: number }> = {}

export function seedPatient(patient: Patient) {
  if (baselines[patient.id]) return
  // Occasionally create a patient with abnormal values (25% chance)
  const isAbnormal = Math.random() < 0.25
  baselines[patient.id] = {
    hr:    isAbnormal ? 105 + Math.random() * 20 : 68 + Math.random() * 20,
    spo2:  isAbnormal ? 91 + Math.random() * 2   : 96 + Math.random() * 3,
    temp:  isAbnormal ? 37.8 + Math.random() * 0.8 : 36.5 + Math.random() * 0.8,
    bpSys: isAbnormal ? 145 + Math.random() * 25 : 110 + Math.random() * 20,
    bpDia: isAbnormal ? 95 + Math.random() * 15  : 70 + Math.random() * 15,
    rr:    isAbnormal ? 22 + Math.random() * 5   : 15 + Math.random() * 4,
  }
  state[patient.id] = { ...baselines[patient.id] }
}

export function nextReading(patientId: string): VitalReading {
  const base = baselines[patientId]
  const s = state[patientId]

  s.hr    = clamp(drift(s.hr,    base.hr,    3),   30, 200)
  s.spo2  = clamp(drift(s.spo2,  base.spo2,  0.4), 85, 100)
  s.temp  = clamp(drift(s.temp,  base.temp,  0.05), 34, 42)
  s.bpSys = clamp(drift(s.bpSys, base.bpSys, 4),   60, 220)
  s.bpDia = clamp(drift(s.bpDia, base.bpDia, 3),   40, 140)
  s.rr    = clamp(drift(s.rr,    base.rr,    1),   6,  40)

  return {
    timestamp:        Date.now(),
    heartRate:        Math.round(s.hr),
    spo2:             Math.round(s.spo2 * 10) / 10,
    temperature:      Math.round(s.temp * 10) / 10,
    bloodPressureSys: Math.round(s.bpSys),
    bloodPressureDia: Math.round(s.bpDia),
    respiratoryRate:  Math.round(s.rr),
  }
}

export const PATIENTS_SEED: Omit<Patient, 'status' | 'isOnline'>[] = [
  { id: 'P001', name: 'Ramesh Kumar',    age: 67, gender: 'M', ward: 'Cardiology',   bed: 'C-04', condition: 'Hypertension',        admittedOn: '2026-04-28', doctorId: 'D001', deviceId: 'ESP32-A1' },
  { id: 'P002', name: 'Sunita Devi',     age: 52, gender: 'F', ward: 'General',      bed: 'G-11', condition: 'Post-surgery',         admittedOn: '2026-04-30', doctorId: 'D001', deviceId: 'ESP32-A2' },
  { id: 'P003', name: 'Arun Mehta',      age: 45, gender: 'M', ward: 'ICU',          bed: 'I-02', condition: 'Cardiac Arrest (rec)', admittedOn: '2026-04-27', doctorId: 'D002', deviceId: 'ESP32-B1' },
  { id: 'P004', name: 'Priya Sharma',    age: 34, gender: 'F', ward: 'Maternity',    bed: 'M-07', condition: 'Post-caesarean',       admittedOn: '2026-04-29', doctorId: 'D002', deviceId: 'ESP32-B2' },
  { id: 'P005', name: 'Kiran Rao',       age: 71, gender: 'M', ward: 'Geriatrics',   bed: 'R-03', condition: 'COPD',                 admittedOn: '2026-04-25', doctorId: 'D001', deviceId: 'ESP32-C1' },
  { id: 'P006', name: 'Meena Pillai',    age: 58, gender: 'F', ward: 'Neurology',    bed: 'N-05', condition: 'Stroke (recovery)',    admittedOn: '2026-04-26', doctorId: 'D003', deviceId: 'ESP32-C2' },
  { id: 'P007', name: 'Suresh Joshi',    age: 63, gender: 'M', ward: 'Cardiology',   bed: 'C-09', condition: 'Arrhythmia',           admittedOn: '2026-04-30', doctorId: 'D003', deviceId: 'ESP32-D1' },
  { id: 'P008', name: 'Kavya Nair',      age: 29, gender: 'F', ward: 'General',      bed: 'G-02', condition: 'Diabetes (Type 2)',    admittedOn: '2026-05-01', doctorId: 'D002', deviceId: 'ESP32-D2' },
]
