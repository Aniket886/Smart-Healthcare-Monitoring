import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole } from '../types'

const DEMO_USERS: User[] = [
  { id: 'D001', name: 'Dr. Anjali Singh',   role: 'doctor' },
  { id: 'N001', name: 'Nurse Kavitha R',    role: 'nurse' },
  { id: 'C001', name: 'Caregiver Mohan K',  role: 'caregiver' },
]

interface AuthState {
  user: User | null
  login: (role: UserRole) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (role) => {
        const user = DEMO_USERS.find(u => u.role === role) ?? DEMO_USERS[0]
        set({ user })
      },
      logout: () => set({ user: null }),
    }),
    { name: 'shm-auth' }
  )
)
