export type UserRole = 'doctor' | 'nurse' | 'caregiver'

export interface User {
  id: string
  name: string
  role: UserRole
  avatar?: string
}

export type VitalStatus = 'normal' | 'warning' | 'critical'

export interface VitalReading {
  timestamp: number
  heartRate: number       // bpm
  spo2: number            // %
  temperature: number     // °C
  bloodPressureSys: number // mmHg systolic
  bloodPressureDia: number // mmHg diastolic
  respiratoryRate: number  // breaths/min
}

export interface Patient {
  id: string
  name: string
  age: number
  gender: 'M' | 'F'
  ward: string
  bed: string
  condition: string
  admittedOn: string
  doctorId: string
  deviceId: string
  status: VitalStatus
  isOnline: boolean
}

export type AlertSeverity = 'info' | 'warning' | 'critical'
export type AlertType = 'heart_rate' | 'spo2' | 'temperature' | 'blood_pressure' | 'respiratory_rate' | 'device_offline'

export interface Alert {
  id: string
  patientId: string
  patientName: string
  type: AlertType
  severity: AlertSeverity
  message: string
  value?: number
  unit?: string
  timestamp: number
  acknowledged: boolean
}

export interface VitalThresholds {
  heartRate: { min: number; max: number; warnMin: number; warnMax: number }
  spo2: { min: number; warnMin: number }
  temperature: { min: number; max: number; warnMin: number; warnMax: number }
  bloodPressureSys: { min: number; max: number; warnMin: number; warnMax: number }
  respiratoryRate: { min: number; max: number; warnMin: number; warnMax: number }
}
