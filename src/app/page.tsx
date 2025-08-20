'use client'

import { useConnectWallet } from '@web3-onboard/react'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useEthers } from '../components/Web3Provider'
import { myNftAddress, myNftABI } from '../contract-config.js'

export default function Home() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
  const { provider } = useEthers()
  const [nftContract, setNftContract] = useState<ethers.Contract | null>(null)
  const [mintAmount, setMintAmount] = useState<string>('')

  useEffect(() => {
    if (provider && wallet) {
      const nft = new ethers.Contract(myNftAddress, myNftABI, provider)
      setNftContract(nft)
    }
  }, [provider, wallet])

  const handleMint = async () => {
    if (!nftContract || !provider) return
    try {
      const signer = provider.getSigner()
      const nftWithSigner = nftContract.connect(signer)
      const tx = await nftWithSigner.mint(mintAmount)
      await tx.wait()
      alert('NFT Minted!')
    } catch (error) {
      console.error("Minting failed:", error)
      alert('Minting failed!')
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 lg:p-24">
      <h1 className="text-4xl font-bold mb-8 text-center">Welcome to the NFT Marketplace</h1>

      <div className="w-full max-w-sm md:max-w-md lg:max-w-lg card">
        <button
          className="w-full btn-primary mb-4"
          disabled={connecting}
          onClick={() => (wallet ? disconnect(wallet) : connect())}
        >
          {connecting ? 'Connecting...' : wallet ? 'Disconnect' : 'Connect Wallet'}
        </button>

        {wallet && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-4">Mint NFT</h2>
            <input
              type="text"
              placeholder="Amount to Mint"
              className="mb-4"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
            />
            <button
              className="w-full btn-primary"
              onClick={handleMint}
            >
              Mint NFT
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
