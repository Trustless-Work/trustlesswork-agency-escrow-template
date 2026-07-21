"use client"
import React, { createContext, useContext, type ReactNode } from 'react'

type WalletContextType = {
  connected: boolean
  address: string | null
  walletName: string | null
  connect: (walletName: string) => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = React.useState(false)
  const [address, setAddress] = React.useState<string | null>(null)
  const [walletName, setWalletName] = React.useState<string | null>(null)

  const connect = async (name: string) => {
    setWalletName(name)
    setAddress('0x1234567890123456789012345678901234567890')
    setConnected(true)
  }

  const disconnect = () => {
    setConnected(false)
    setAddress(null)
    setWalletName(null)
  }

  return (
    <WalletContext.Provider
      value={{ connected, address, walletName, connect, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider')
  }
  return context
}
