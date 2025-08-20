'use client'

import { useConnectWallet } from '@web3-onboard/react'
import { ethers, keccak256, getBytes, solidityPacked } from 'ethers'
import { useEffect, useState } from 'react'
import { useEthers } from '../Web3Provider'
import { myNftAddress, myNftABI } from '../../contract-config.js'

export default function LazyMint() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
  const { provider } = useEthers()
  const [nftContract, setNftContract] = useState<ethers.Contract | null>(null)
  const [tokenURI, setTokenURI] = useState<string>('')
  const [signature, setSignature] = useState<string>('')
  const [signedTokenId, setSignedTokenId] = useState<string>('')

  useEffect(() => {
    if (provider && wallet) {
      const nft = new ethers.Contract(myNftAddress, myNftABI, provider)
      setNftContract(nft)
    }
  }, [provider, wallet])

  const handleSignMint = async () => {
    if (!nftContract || !provider) return
    try {
      const signer = provider.getSigner()
      const messageHash = keccak256(solidityPacked(["string", "uint256"], [tokenURI, signedTokenId]))
      const signature = await signer.signMessage(getBytes(messageHash))
      setSignature(signature)
      alert('Mint Signature Generated!')
    } catch (error) {
      console.error("Signing mint failed:", error)
      alert('Signing mint failed!')
    }
  }

  const handleLazyMint = async () => {
    if (!nftContract || !provider || !signature || !signedTokenId) return
    try {
      const signer = provider.getSigner()
      const nftWithSigner = nftContract.connect(signer)
      const tx = await nftWithSigner.lazyMint(tokenURI, signedTokenId, signature)
      await tx.wait()
      alert('NFT Lazy Minted!')
    } catch (error) {
      console.error("Lazy mint failed:", error)
      alert('Lazy mint failed!')
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 lg:p-24">
      <h1 className="text-4xl font-bold mb-8 text-center">Lazy Minting</h1>

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
            <h2 className="text-xl font-semibold mb-4">Generate Mint Signature</h2>
            <input
              type="text"
              placeholder="Token URI"
              className="mb-2"
              value={tokenURI}
              onChange={(e) => setTokenURI(e.target.value)}
            />
            <input
              type="text"
              placeholder="Token ID"
              className="mb-4"
              value={signedTokenId}
              onChange={(e) => setSignedTokenId(e.target.value)}
            />
            <button
              className="w-full btn-primary"
              onClick={handleSignMint}
            >
              Sign Mint
            </button>

            {signature && (
              <div className="mt-4">
                <p className="break-all">Signature: {signature}</p>
                <button
                  className="w-full btn-primary mt-4"
                  onClick={handleLazyMint}
                >
                  Lazy Mint NFT
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
