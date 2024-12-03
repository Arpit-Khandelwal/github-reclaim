import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import ContributorNFTABI from '../../../contracts/ContributorNFT.json';

const NFT_CONTRACT_ADDRESS = '0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { proofs } = body;

    if (!proofs || proofs.length === 0) {
      return NextResponse.json({ error: 'No proofs provided' }, { status: 400 });
    }

    // Extract contributions count from proof
    const contributionsCount = parseInt(proofs[0].parameters.contributions);
    const userAddress = proofs[0].parameters.address;

    // Initialize contract interaction
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, ContributorNFTABI, wallet);

    // Mint or update NFT based on contributions
    const hasNFT = await contract.contributorToTokenId(userAddress);
    
    if (hasNFT.toNumber() === 0) {
      await contract.mintNFT(userAddress, contributionsCount);
    } else {
      await contract.updateContributions(userAddress, contributionsCount);
    }

    return NextResponse.json({ 
      success: true, 
      contributions: contributionsCount 
    });
  } catch (error) {
    console.error('Error processing callback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}