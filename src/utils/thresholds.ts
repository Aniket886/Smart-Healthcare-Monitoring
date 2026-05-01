import type { VitalThresholds, VitalStatus, VitalReading } from '../types'

export const THRESHOLDS: VitalThresholds = {
  heartRate:        { min: 40,  warnMin: 50,  warnMax: 100, max: 130 },
  spo2:             { min: 90,  warnMin: 94 },
  temperature:      { min: 35.0, warnMin: 36.0, warnMax: 37.5, max: 39.5 },
  bloodPressureSys: { min: 70,  warnMin: 90,  warnMax: 140, max: 180 },
  respiratoryRate:  { min: 8,   warnMin: 12,  warnMax: 20,  max: 30  },
}

export function getVitalStatus(reading: VitalReading): VitalStatus {
  const t = THRESHOLDS
  const critical =
    reading.heartRate < t.heartRate.min || reading.heartRate > t.heartRate.max ||
    reading.spo2 < t.spo2.min ||
    reading.temperature < t.temperature.min || reading.temperature > t.temperature.max ||
    reading.bloodPressureSys < t.bloodPressureSys.min || reading.bloodPressureSys > t.bloodPressureSys.max ||
    reading.respiratoryRate < t.respiratoryRate.min || reading.respiratoryRate > t.respiratoryRate.max

  if (critical) return 'critical'

  const warning =
    reading.heartRate < t.heartRate.warnMin || reading.heartRate > t.heartRate.warnMax ||
    reading.spo2 < t.spo2.warnMin ||
    reading.temperature < t.temperature.warnMin || reading.temperature > t.temperature.warnMax ||
    reading.bloodPressureSys < t.bloodPressureSys.warnMin || reading.bloodPressureSys > t.bloodPressureSys.warnMax ||
    reading.respiratoryRate < t.respiratoryRate.warnMin || reading.respiratoryRate > t.respiratoryRate.warnMax

  return warning ? 'warning' : 'normal'
}

export function getHeartRateStatus(v: number): VitalStatus {
  const t = THRESHOLDS.heartRate
  if (v < t.min || v > t.max) return 'critical'
  if (v < t.warnMin || v > t.warnMax) return 'warning'
  return 'normal'
}

export function getSpo2Status(v: number): VitalStatus {
  const t = THRESHOLDS.spo2
  if (v < t.min) return 'critical'
  if (v < t.warnMin) return 'warning'
  return 'normal'
}

export function getTempStatus(v: number): VitalStatus {
  const t = THRESHOLDS.temperature
  if (v < t.min || v > t.max) return 'critical'
  if (v < t.warnMin || v > t.warnMax) return 'warning'
  return 'normal'
}

export function getBPStatus(sys: number): VitalStatus {
  const t = THRESHOLDS.bloodPressureSys
  if (sys < t.min || sys > t.max) return 'critical'
  if (sys < t.warnMin || sys > t.warnMax) return 'warning'
  return 'normal'
}

export function getRespStatus(v: number): VitalStatus {
  const t = THRESHOLDS.respiratoryRate
  if (v < t.min || v > t.max) return 'critical'
  if (v < t.warnMin || v > t.warnMax) return 'warning'
  return 'normal'
}

export const STATUS_COLOR: Record<VitalStatus, string> = {
  normal:   'text-emerald-400',
  warning:  'text-amber-400',
  critical: 'text-red-400',
}

export const STATUS_BG: Record<VitalStatus, string> = {
  normal:   'bg-emerald-500/10 border-emerald-500/30',
  warning:  'bg-amber-500/10 border-amber-500/30',
  critical: 'bg-red-500/10 border-red-500/30',
}

export const STATUS_DOT: Record<VitalStatus, string> = {
  normal:   'bg-emerald-400',
  warning:  'bg-amber-400',
  critical: 'bg-red-400',
}
