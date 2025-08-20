'use client'

import { useConnectWallet } from '@web3-onboard/react'
import { ethers, parseEther } from 'ethers'
import { useEffect, useState } from 'react'
import { useEthers } from '../Web3Provider'
import { myNftAddress, myNftABI, marketplaceAddress, marketplaceABI, auctionAddress, auctionABI } from '../../contract-config.js'

export default function Admin() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
  const { provider } = useEthers()
  const [nftContract, setNftContract] = useState<ethers.Contract | null>(null)
  const [marketplaceContract, setMarketplaceContract] = useState<ethers.Contract | null>(null)
  const [auctionContract, setAuctionContract] = useState<ethers.Contract | null>(null)
  const [listingFee, setListingFee] = useState<string>('')
  const [lootBoxPrice, setLootBoxPrice] = useState<string>('')
  const [commonURI, setCommonURI] = useState<string>('')
  const [rareURI, setRareURI] = useState<string>('')
  const [legendaryURI, setLegendaryURI] = useState<string>('')
  const [bep20TokenAddressInput, setBep20TokenAddressInput] = useState<string>('')

  useEffect(() => {
    if (provider && wallet) {
      const nft = new ethers.Contract(myNftAddress, myNftABI, provider)
      setNftContract(nft)

      const marketplace = new ethers.Contract(marketplaceAddress, marketplaceABI, provider)
      setMarketplaceContract(marketplace)

      const auction = new ethers.Contract(auctionAddress, auctionABI, provider)
      setAuctionContract(auction)
    }
  }, [provider, wallet])

  const handleSetListingFee = async () => {
    if (!marketplaceContract || !provider) return
    try {
      const signer = provider.getSigner()
      const marketplaceWithSigner = marketplaceContract.connect(signer)
      const tx = await marketplaceWithSigner.setListingFee(listingFee)
      await tx.wait()
      alert('Listing Fee Set!')
    } catch (error) {
      console.error("Setting listing fee failed:", error)
      alert('Setting listing fee failed!')
    }
  }

  const handleSetLootBoxPrice = async () => {
    if (!nftContract || !provider) return
    try {
      const signer = provider.getSigner()
      const nftWithSigner = nftContract.connect(signer)
      const tx = await nftWithSigner.setLootBoxPrice(parseEther(lootBoxPrice))
      await tx.wait()
      alert('Loot Box Price Set!')
    } catch (error) {
      console.error("Setting loot box price failed:", error)
      alert('Setting loot box price failed!')
    }
  }

  const handleSetTokenURIs = async () => {
    if (!nftContract || !provider) return
    try {
      const signer = provider.getSigner()
      const nftWithSigner = nftContract.connect(signer)
      const tx = await nftWithSigner.setTokenURIs(commonURI, rareURI, legendaryURI)
      await tx.wait()
      alert('Token URIs Set!')
    } catch (error) {
      console.error("Setting token URIs failed:", error)
      alert('Setting token URIs failed!')
    }
  }

  const handleSetBep20TokenAddress = async () => {
    if (!marketplaceContract || !auctionContract || !provider) return
    try {
      const signer = provider.getSigner()
      const marketplaceWithSigner = marketplaceContract.connect(signer)
      const auctionWithSigner = auctionContract.connect(signer)

      let tx = await marketplaceWithSigner.setBep20TokenAddress(bep20TokenAddressInput)
      await tx.wait()
      alert('BEP20 Token Address Set in Marketplace!')

      tx = await auctionWithSigner.setBep20TokenAddress(bep20TokenAddressInput)
      await tx.wait()
      alert('BEP20 Token Address Set in Auction!')
    } catch (error) {
      console.error("Setting BEP20 token address failed:", error)
      alert('Setting BEP20 token address failed!')
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 lg:p-24">
      <h1 className="text-4xl font-bold mb-8 text-center">Admin Panel</h1>

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
            <h2 className="text-xl font-semibold mb-4">Set Listing Fee (Percentage)</h2>
            <input
              type="text"
              placeholder="e.g., 1 for 1%"
              className="mb-4"
              value={listingFee}
              onChange={(e) => setListingFee(e.target.value)}
            />
            <button
              className="w-full btn-primary"
              onClick={handleSetListingFee}
            >
              Set Listing Fee
            </button>

            <h2 className="text-xl font-semibold mt-8 mb-4">Set Loot Box Price (BNB)</h2>
            <input
              type="text"
              placeholder="e.g., 0.01"
              className="mb-4"
              value={lootBoxPrice}
              onChange={(e) => setLootBoxPrice(e.target.value)}
            />
            <button
              className="w-full btn-primary"
              onClick={handleSetLootBoxPrice}
            >
              Set Loot Box Price
            </button>

            <h2 className="text-xl font-semibold mt-8 mb-4">Set Token URIs</h2>
            <input
              type="text"
              placeholder="Common URI"
              className="mb-2"
              value={commonURI}
              onChange={(e) => setCommonURI(e.target.value)}
            />
            <input
              type="text"
              placeholder="Rare URI"
              className="mb-2"
              value={rareURI}
              onChange={(e) => setRareURI(e.target.value)}
            />
            <input
              type="text"
              placeholder="Legendary URI"
              className="mb-4"
              value={legendaryURI}
              onChange={(e) => setLegendaryURI(e.target.value)}
            />
            <button
              className="w-full btn-primary"
              onClick={handleSetTokenURIs}
            >
              Set Token URIs
            </button>

            <h2 className="text-xl font-semibold mt-8 mb-4">Set BEP20 Token Address</h2>
            <input
              type="text"
              placeholder="BEP20 Token Address"
              className="mb-4"
              value={bep20TokenAddressInput}
              onChange={(e) => setBep20TokenAddressInput(e.target.value)}
            />
            <button
              className="w-full btn-primary"
              onClick={handleSetBep20TokenAddress}
            >
              Set BEP20 Token Address
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
