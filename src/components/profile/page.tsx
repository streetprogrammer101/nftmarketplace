'use client'

import { useConnectWallet } from '@web3-onboard/react'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useEthers } from '../Web3Provider'
import { myNftAddress, myNftABI } from '../../contract-config.js'

export default function Profile() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
  const { provider } = useEthers()
  const [nftContract, setNftContract] = useState<ethers.Contract | null>(null)
  const [ownedNFTs, setOwnedNFTs] = useState<any[]>([])

  useEffect(() => {
    if (provider && wallet) {
      const nft = new ethers.Contract(myNftAddress, myNftABI, provider)
      setNftContract(nft)
      fetchOwnedNFTs(nft, wallet.accounts[0].address)
    }
  }, [provider, wallet])

  const fetchOwnedNFTs = async (nftContract: ethers.Contract, ownerAddress: string) => {
    try {
      const balance = await nftContract.balanceOf(ownerAddress)
      const nfts = []
      for (let i = 0; i < balance; i++) {
        const tokenId = await nftContract.tokenOfOwnerByIndex(ownerAddress, i)
        const tokenURI = await nftContract.tokenURI(tokenId)
        nfts.push({ tokenId: tokenId.toString(), tokenURI })
      }
      setOwnedNFTs(nfts)
    } catch (error) {
      console.error("Failed to fetch owned NFTs:", error)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 lg:p-24">
      <h1 className="text-4xl font-bold mb-8 text-center">My Profile</h1>

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
            <h2 className="text-xl font-semibold mb-4">My NFTs</h2>
            {ownedNFTs.length === 0 ? (
              <p className="text-center">You don't own any NFTs yet.</p>
            ) : (
              <ul className="space-y-4">
                {ownedNFTs.map((nft) => (
                  <li key={nft.tokenId} className="p-4 border rounded-lg card">
                    <p className="font-semibold">Token ID: {nft.tokenId}</p>
                    <p className="break-all">URI: {nft.tokenURI}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </main>
  )
}