"use client"
import React, { createContext, useContext, type ReactNode } from 'react'

type TrustlessWorkContextType = {
  initialized: boolean
  mode: 'testnet' | 'mainnet'
}

const TrustlessWorkContext = createContext<TrustlessWorkContextType | undefined>(
  undefined
)

export function TrustlessWorkProvider({ children }: { children: ReactNode }) {
  const initialized = true
  const mode = 'testnet' as const

  return (
    <TrustlessWorkContext.Provider value={{ initialized, mode }}>
      {children}
    </TrustlessWorkContext.Provider>
  )
}

export function useTrustlessWork() {
  const context = useContext(TrustlessWorkContext)
  if (!context) {
    throw new Error(
      'useTrustlessWork must be used within TrustlessWorkProvider'
    )
  }
  return context
}
