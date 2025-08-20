'use client'

import { init, useConnectWallet } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'
import { ethers, BrowserProvider } from 'ethers'
import { createContext, useContext, useEffect, useState } from 'react'

// Initialize Web3-Onboard
const injected = injectedModule()

const chains = [
  {
    id: '0x7A69', // 1337 in hex, for Hardhat
    token: 'ETH',
    label: 'Hardhat Local',
    rpcUrl: 'http://localhost:8545'
  }
]

init({
  wallets: [injected],
  chains: chains,
  appMetadata: {
    name: 'BSC NFT Marketplace',
    icon: '<svg>My App Icon</svg>',
    description: 'A simple NFT marketplace on BSC.'
  }
})

// Create a context for the ethers provider
const EthersContext = createContext<{ provider: BrowserProvider | null }>({ provider: null })

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [{ wallet }] = useConnectWallet()
  const [ethersProvider, setEthersProvider] = useState<BrowserProvider | null>(null)

  useEffect(() => {
    if (wallet) {
      const provider = new BrowserProvider(wallet.provider, 'any')
      setEthersProvider(provider)
    }
  }, [wallet])

  return (
    <EthersContext.Provider value={{ provider: ethersProvider }}>
      {children}
    </EthersContext.Provider>
  )
}

export const useEthers = () => useContext(EthersContext)
