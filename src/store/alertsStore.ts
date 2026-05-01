import { create } from 'zustand'
import type { Alert, AlertSeverity, AlertType, VitalReading, Patient } from '../types'
import { THRESHOLDS } from '../utils/thresholds'

let alertCounter = 0

function makeAlert(
  patient: Patient,
  type: AlertType,
  severity: AlertSeverity,
  message: string,
  value?: number,
  unit?: string,
): Alert {
  return {
    id: `ALT-${++alertCounter}`,
    patientId: patient.id,
    patientName: patient.name,
    type,
    severity,
    message,
    value,
    unit,
    timestamp: Date.now(),
    acknowledged: false,
  }
}

interface AlertsState {
  alerts: Alert[]
  unreadCount: number
  addAlertsFromReading: (patient: Patient, reading: VitalReading) => void
  acknowledge: (id: string) => void
  acknowledgeAll: () => void
  clearOld: () => void
}

export const useAlertsStore = create<AlertsState>((set) => ({
  alerts: [],
  unreadCount: 0,

  addAlertsFromReading: (patient, reading) => {
    const newAlerts: Alert[] = []
    const t = THRESHOLDS

    if (reading.heartRate > t.heartRate.max || reading.heartRate < t.heartRate.min) {
      newAlerts.push(makeAlert(patient, 'heart_rate', 'critical',
        `Heart rate ${reading.heartRate > t.heartRate.max ? 'critically high' : 'critically low'}: ${reading.heartRate} bpm`,
        reading.heartRate, 'bpm'))
    } else if (reading.heartRate > t.heartRate.warnMax || reading.heartRate < t.heartRate.warnMin) {
      newAlerts.push(makeAlert(patient, 'heart_rate', 'warning',
        `Heart rate ${reading.heartRate > t.heartRate.warnMax ? 'elevated' : 'low'}: ${reading.heartRate} bpm`,
        reading.heartRate, 'bpm'))
    }

    if (reading.spo2 < t.spo2.min) {
      newAlerts.push(makeAlert(patient, 'spo2', 'critical',
        `Critically low SpO₂: ${reading.spo2}%`, reading.spo2, '%'))
    } else if (reading.spo2 < t.spo2.warnMin) {
      newAlerts.push(makeAlert(patient, 'spo2', 'warning',
        `Low SpO₂: ${reading.spo2}%`, reading.spo2, '%'))
    }

    if (reading.temperature > t.temperature.max) {
      newAlerts.push(makeAlert(patient, 'temperature', 'critical',
        `High fever: ${reading.temperature}°C`, reading.temperature, '°C'))
    } else if (reading.temperature > t.temperature.warnMax) {
      newAlerts.push(makeAlert(patient, 'temperature', 'warning',
        `Elevated temperature: ${reading.temperature}°C`, reading.temperature, '°C'))
    }

    if (reading.bloodPressureSys > t.bloodPressureSys.max) {
      newAlerts.push(makeAlert(patient, 'blood_pressure', 'critical',
        `Hypertensive crisis: ${reading.bloodPressureSys}/${reading.bloodPressureDia} mmHg`,
        reading.bloodPressureSys, 'mmHg'))
    } else if (reading.bloodPressureSys > t.bloodPressureSys.warnMax) {
      newAlerts.push(makeAlert(patient, 'blood_pressure', 'warning',
        `High blood pressure: ${reading.bloodPressureSys}/${reading.bloodPressureDia} mmHg`,
        reading.bloodPressureSys, 'mmHg'))
    }

    if (reading.respiratoryRate > t.respiratoryRate.max || reading.respiratoryRate < t.respiratoryRate.min) {
      newAlerts.push(makeAlert(patient, 'respiratory_rate', 'critical',
        `Respiratory rate critical: ${reading.respiratoryRate} br/min`, reading.respiratoryRate, 'br/min'))
    }

    if (newAlerts.length === 0) return

    set(state => ({
      alerts: [...newAlerts, ...state.alerts].slice(0, 200),
      unreadCount: state.unreadCount + newAlerts.length,
    }))
  },

  acknowledge: (id) => set(state => ({
    alerts: state.alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),

  acknowledgeAll: () => set(state => ({
    alerts: state.alerts.map(a => ({ ...a, acknowledged: true })),
    unreadCount: 0,
  })),

  clearOld: () => {
    const cutoff = Date.now() - 1000 * 60 * 60 // 1 hour
    set(state => ({
      alerts: state.alerts.filter(a => a.timestamp > cutoff || !a.acknowledged),
    }))
  },
}))
