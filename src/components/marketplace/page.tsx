'use client'

import { useConnectWallet } from '@web3-onboard/react'
import { ethers, parseUnits } from 'ethers'
import { useEffect, useState } from 'react'
import { useEthers } from '../Web3Provider'
import { myNftAddress, myNftABI, marketplaceAddress, marketplaceABI, bep20TokenAddress, bep20TokenABI } from '../../contract-config.js'

export default function Marketplace() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
  const { provider } = useEthers()
  const [nftContract, setNftContract] = useState<ethers.Contract | null>(null)
  const [marketplaceContract, setMarketplaceContract] = useState<ethers.Contract | null>(null)
  const [bep20TokenContract, setBep20TokenContract] = useState<ethers.Contract | null>(null)
  const [tokenId, setTokenId] = useState<string>('')
  const [price, setPrice] = useState<string>('')
  const [listingTokenId, setListingTokenId] = useState<string>('')
  const [listedNFTs, setListedNFTs] = useState<any[]>([])

  const fetchListedNFTs = async () => {
    if (!marketplaceContract || !nftContract) return
    // This is a placeholder. In a real app, you'd fetch events or query contract state.
    // For now, we'll simulate some listed NFTs.
    setListedNFTs([
      { nftAddress: myNftAddress, tokenId: 1, price: '0.05', seller: '0xabc...' },
      { nftAddress: myNftAddress, tokenId: 2, price: '0.1', seller: '0xdef...' },
    ])
  }

  const handleListNFT = async () => {
    if (!nftContract || !marketplaceContract || !provider) return
    try {
      const signer = provider.getSigner()
      const nftWithSigner = nftContract.connect(signer)
      const marketplaceWithSigner = marketplaceContract.connect(signer)

      // Approve the marketplace to spend the NFT
      const approveNFTTx = await nftWithSigner.approve(marketplaceAddress, tokenId)
      await approveNFTTx.wait()
      alert('NFT Approved!')

      // List the NFT
      const listTx = await marketplaceWithSigner.listNft(myNftAddress, tokenId, parseUnits(price, 18))
      await listTx.wait()
      alert('NFT Listed!')
      fetchListedNFTs()
    } catch (error) {
      console.error("Listing failed:", error)
      alert('Listing failed!')
    }
  }

  const handleBuyNFT = async (nftAddress: string, tokenId: number, price: string) => {
    if (!marketplaceContract || !bep20TokenContract || !provider) return
    try {
      const signer = provider.getSigner()
      const marketplaceWithSigner = marketplaceContract.connect(signer)
      const bep20WithSigner = bep20TokenContract.connect(signer)

      // Approve the marketplace to spend BEP20 tokens
      const approveTokenTx = await bep20WithSigner.approve(marketplaceAddress, parseUnits(price, 18))
      await approveTokenTx.wait()
      alert('BEP20 Token Approved!')

      const buyTx = await marketplaceWithSigner.buyNft(nftAddress, tokenId)
      await buyTx.wait()
      alert('NFT Purchased!')
      fetchListedNFTs()
    } catch (error) {
      console.error("Purchase failed:", error)
      alert('Purchase failed!')
    }
  }

  const handleCancelListing = async () => {
    if (!marketplaceContract || !provider) return
    try {
      const signer = provider.getSigner()
      const marketplaceWithSigner = marketplaceContract.connect(signer)

      const cancelTx = await marketplaceWithSigner.cancelListing(myNftAddress, listingTokenId)
      await cancelTx.wait()
      alert('Listing Cancelled!')
      fetchListedNFTs()
    } catch (error) {
      console.error("Cancellation failed:", error)
      alert('Cancellation failed!')
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 lg:p-24">
      <h1 className="text-4xl font-bold mb-8 text-center">NFT Marketplace</h1>

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
            <h2 className="text-xl font-semibold mb-4">List NFT</h2>
            <input
              type="text"
              placeholder="Token ID"
              className="mb-2"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
            />
            <input
              type="text"
              placeholder="Price (BEP20)"
              className="mb-4"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <button
              className="w-full btn-primary"
              onClick={handleListNFT}
            >
              List NFT
            </button>

            <h2 className="text-xl font-semibold mt-8 mb-4">Listed NFTs</h2>
            {listedNFTs.length === 0 ? (
              <p className="text-center">No NFTs listed.</p>
            ) : (
              <ul className="space-y-4">
                {listedNFTs.map((nft) => (
                  <li key={nft.tokenId} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-center card">
                    <div className="text-center sm:text-left mb-2 sm:mb-0">
                      <p className="font-semibold">Token ID: {nft.tokenId}</p>
                      <p>Price: {nft.price} BEP20</p>
                    </div>
                    <button
                      className="btn-primary mt-2 sm:mt-0"
                      onClick={() => handleBuyNFT(nft.nftAddress, nft.tokenId, nft.price)}
                    >
                      Buy
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <h2 className="text-xl font-semibold mt-8 mb-4">Cancel Listing</h2>
            <input
              type="text"
              placeholder="Token ID to Cancel"
              className="mb-4"
              value={listingTokenId}
              onChange={(e) => setListingTokenId(e.target.value)}
            />
            <button
              className="w-full btn-secondary"
              onClick={handleCancelListing}
            >
              Cancel Listing
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
