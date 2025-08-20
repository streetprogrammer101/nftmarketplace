'use client'

import { useConnectWallet } from '@web3-onboard/react'
import { ethers, parseUnits } from 'ethers'
import { useEffect, useState } from 'react'
import { useEthers } from '../Web3Provider'
import { myNftAddress, myNftABI, auctionAddress, auctionABI, bep20TokenAddress, bep20TokenABI } from '../../contract-config.js'

export default function Auction() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
  const { provider } = useEthers()
  const [nftContract, setNftContract] = useState<ethers.Contract | null>(null)
  const [auctionContract, setAuctionContract] = useState<ethers.Contract | null>(null)
  const [bep20TokenContract, setBep20TokenContract] = useState<ethers.Contract | null>(null)
  const [tokenId, setTokenId] = useState<string>('')
  const [startingPrice, setStartingPrice] = useState<string>('')
  const [duration, setDuration] = useState<string>('')
  const [auctionId, setAuctionId] = useState<string>('')
  const [bidAmount, setBidAmount] = useState<string>('')
  const [activeAuctions, setActiveAuctions] = useState<any[]>([])

  useEffect(() => {
    if (provider && wallet) {
      const nft = new ethers.Contract(myNftAddress, myNftABI, provider)
      setNftContract(nft)

      const auction = new ethers.Contract(auctionAddress, auctionABI, provider)
      setAuctionContract(auction)

      const bep20 = new ethers.Contract(bep20TokenAddress, bep20TokenABI, provider)
      setBep20TokenContract(bep20)

      fetchActiveAuctions(auction)
    }
  }, [provider, wallet])

  const fetchActiveAuctions = async (auctionContract: ethers.Contract) => {
    const auctionsArray = [];
    // Assuming auction IDs start from 1 and go up to a reasonable number for demonstration
    // In a real app, you'd use events or an indexer to get active auction IDs
    for (let i = 1; i <= 10; i++) { // Check first 10 potential auction IDs
      try {
        const auction = await auctionContract.auctions(i);
        // Check if the auction is active (not settled and end time not passed)
        if (auction.nftAddress !== ethers.ZeroAddress && !auction.settled && auction.endTime * 1000 > Date.now()) {
          auctionsArray.push({
            auctionId: i,
            nftAddress: auction.nftAddress,
            tokenId: auction.tokenId.toString(),
            startingPrice: ethers.formatUnits(auction.startingPrice, 18),
            highestBid: ethers.formatUnits(auction.highestBid, 18),
            highestBidder: auction.highestBidder,
            endTime: new Date(Number(auction.endTime) * 1000).toLocaleString(),
            settled: auction.settled,
          });
        }
      } catch (error) {
        // Auction ID might not exist, or other error
        console.log(`Error fetching auction ${i}:`, error);
      }
    }
    setActiveAuctions(auctionsArray);
  };

  useEffect(() => {
    if (provider && wallet && auctionContract) {
      fetchActiveAuctions(auctionContract);
    }
  }, [provider, wallet, auctionContract]);

  const handleCreateAuction = async () => {
    if (!nftContract || !auctionContract || !provider) return
    try {
      const signer = provider.getSigner()
      const nftWithSigner = nftContract.connect(signer)
      const auctionWithSigner = auctionContract.connect(signer)

      // Approve the auction contract to transfer the NFT
      const approveNFTTx = await nftWithSigner.approve(auctionAddress, tokenId)
      await approveNFTTx.wait()
      alert('NFT Approved for Auction!')

      // Create the auction
      const createTx = await auctionWithSigner.createAuction(
        myNftAddress,
        tokenId,
        parseUnits(startingPrice, 18),
        duration
      )
      await createTx.wait()
      alert('Auction Created!')
      fetchActiveAuctions()
    } catch (error) {
      console.error("Creating auction failed:", error)
      alert('Creating auction failed!')
    }
  }

  const handlePlaceBid = async (id: number) => {
    if (!auctionContract || !bep20TokenContract || !provider) return
    try {
      const signer = provider.getSigner()
      const auctionWithSigner = auctionContract.connect(signer)
      const bep20WithSigner = bep20TokenContract.connect(signer)

      // Approve the auction contract to spend BEP20 tokens
      const approveTokenTx = await bep20WithSigner.approve(auctionAddress, parseUnits(bidAmount, 18))
      await approveTokenTx.wait()
      alert('BEP20 Token Approved!')

      const bidTx = await auctionWithSigner.placeBid(id, parseUnits(bidAmount, 18))
      await bidTx.wait()
      alert('Bid Placed!')
      fetchActiveAuctions()
    } catch (error) {
      console.error("Placing bid failed:", error)
      alert('Placing bid failed!')
    }
  }

  const handleSettleAuction = async (id: number) => {
    if (!auctionContract || !provider) return
    try {
      const signer = provider.getSigner()
      const auctionWithSigner = auctionContract.connect(signer)

      const settleTx = await auctionWithSigner.settleAuction(id)
      await settleTx.wait()
      alert('Auction Settled!')
      fetchActiveAuctions()
    } catch (error) {
      console.error("Settling auction failed:", error)
      alert('Settling auction failed!')
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 lg:p-24">
      <h1 className="text-4xl font-bold mb-8 text-center">NFT Auction</h1>

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
            <h2 className="text-xl font-semibold mb-4">Create Auction</h2>
            <input
              type="text"
              placeholder="Token ID"
              className="mb-2"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
            />
            <input
              type="text"
              placeholder="Starting Price (BEP20)"
              className="mb-2"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
            />
            <input
              type="text"
              placeholder="Duration (seconds)"
              className="mb-4"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            <button
              className="w-full btn-primary"
              onClick={handleCreateAuction}
            >
              Create Auction
            </button>

            <h2 className="text-xl font-semibold mt-8 mb-4">Active Auctions</h2>
            {activeAuctions.length === 0 ? (
              <p className="text-center">No active auctions.</p>
            ) : (
              <ul className="space-y-4">
                {activeAuctions.map((auction) => (
                  <li key={auction.auctionId} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-center card">
                    <div className="text-center sm:text-left mb-2 sm:mb-0">
                      <p className="font-semibold">Auction ID: {auction.auctionId}</p>
                      <p>Token ID: {auction.tokenId}</p>
                      <p>Highest Bid: {auction.highestBid} BEP20</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center mt-2 sm:mt-0">
                      <input
                        type="text"
                        placeholder="Your Bid (BEP20)"
                        className="mb-2 sm:mb-0 sm:mr-2 w-full sm:w-auto"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                      />
                      <button
                        className="btn-primary mb-2 sm:mb-0 sm:mr-2"
                        onClick={() => handlePlaceBid(auction.auctionId)}
                      >
                        Place Bid
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => handleSettleAuction(auction.auctionId)}
                      >
                        Settle
                      </button>
                    </div>
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
