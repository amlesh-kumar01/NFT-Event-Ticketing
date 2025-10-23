# NFT Event Ticketing

A decentralized event ticketing system using NFTs to represent event tickets. This repository contains Solidity smart contracts, deployment scripts, and frontend integration examples to mint, transfer, and validate ticket NFTs.

## Features
- Mint NFT tickets (ERC-721)
- Per-ticket metadata stored on IPFS (event details, seat, date)
- Transfer and revoke tickets
- On-chain ownership and off-chain metadata


## Tech Stack
- Solidity (ERC-721)
- Hardhat (development & deployment)
- Ethers.js (frontend)
- IPFS / nft.storage or Pinata (metadata hosting)
- Polygon (Mumbai testnet for deployment)

## Prerequisites
- Node.js (>=16)
- npm or yarn
- MetaMask (for frontend testing)
- Alchemy or Infura account (RPC provider) or public RPC
- Polygon Mumbai testnet MATIC (faucet)
- nft.storage or Pinata account (optional, for metadata)

## Local Setup
1. Clone and install:
   npm install
2. Create a .env with:
   - ALCHEMY_API_KEY (or RPC_URL)
   - PRIVATE_KEY (deployer private key, testnet only)
   - POLYGONSCAN_API_KEY (optional, for verification)
   - NFT_STORAGE_KEY or PINATA_API_KEY / PINATA_SECRET (optional)

## Deploy to Polygon (Mumbai) — Hardhat
1. Configure hardhat.config.js:
   - Add network entry for mumbai using RPC URL (Alchemy/Infura) and PRIVATE_KEY.
   - Set etherscan.apiKey for polygonMumbai if verifying.

2. Get test MATIC:
   - Use Mumbai faucet: https://faucet.polygon.technology/ or relevant faucet.

3. Compile:
   npx hardhat compile

4. Deploy:
   npx hardhat run --network mumbai scripts/deploy.js

   - scripts/deploy.js should export a deployment that logs the deployed contract address.

5. Verify (optional):
   npx hardhat verify --network mumbai <CONTRACT_ADDRESS> "ConstructorArg1" "ConstructorArg2"
   - Ensure POLYGONSCAN_API_KEY is set in .env.

## Metadata & IPFS
- Create metadata JSON for each ticket (name, description, image, attributes).
- Upload metadata JSON and assets to nft.storage or Pinata.
- Use returned IPFS CID as tokenURI when minting.
- Example tokenURI: ipfs://bafy...

## Frontend Integration (React + Ethers.js)
1. Install ethers:
   npm install ethers

2. Connect to MetaMask:
   const provider = new ethers.providers.Web3Provider(window.ethereum);
   await provider.send("eth_requestAccounts", []);
   const signer = provider.getSigner();

3. Instantiate contract:
   import ContractABI from './abi/TicketNFT.json';
   const contract = new ethers.Contract(CONTRACT_ADDRESS, ContractABI, signer);

4. Mint ticket (example):
   const tx = await contract.mintTicket(recipientAddress, tokenURI);
   await tx.wait();

5. Read owner / metadata:
   const owner = await contract.ownerOf(tokenId);
   const uri = await contract.tokenURI(tokenId);
   // Fetch metadata from IPFS gateway: https://ipfs.io/ipfs/<CID>

6. Listen to events:
   contract.on("Transfer", (from, to, tokenId) => {
     // update UI
   });

## Environment variables (example .env)
ALCHEMY_API_KEY="your-alchemy-key"
RPC_URL="https://polygon-mumbai.g.alchemy.com/v2/your-alchemy-key"
PRIVATE_KEY="0xabc..."
POLYGONSCAN_API_KEY="your-polygonscan-key"
NFT_STORAGE_KEY="your-nft-storage-key"

## Best Practices
- Use test accounts and testnet before mainnet.
- Do not commit private keys or secrets.
- Pin metadata to ensure availability.
- Add access controls for administrative functions if needed.

## Troubleshooting
- If gas errors occur, ensure the RPC and funds are correct.
- For verification failures, match compiler version and settings.

## License
MIT