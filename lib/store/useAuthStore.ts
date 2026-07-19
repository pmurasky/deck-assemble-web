import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  register: (name: string, email: string) => void;
  login: (email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      // In a real app, registration/login would verify passwords against a DB.
      // Here we just mock the session.
      register: (name, email) => set({
        user: {
          id: crypto.randomUUID(),
          name,
          email
        },
        isAuthenticated: true
      }),

      login: (email) => set({
        // Mocking user info for login since we don't store a separate users table
        user: {
          id: crypto.randomUUID(),
          name: email.split('@')[0], 
          email
        },
        isAuthenticated: true
      }),

      logout: () => set({
        user: null,
        isAuthenticated: false
      })
    }),
    {
      name: 'deck-assemble-auth-storage',
    }
  )
);
