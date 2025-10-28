# 🎫 NFT Event Ticketing System

A decentralized event ticketing platform built on blockchain technology using NFTs (ERC-721) for transparent, secure, and fraud-resistant ticket management.

## ✨ Features

- **NFT-Based Tickets**: Each ticket is a unique NFT that prevents counterfeiting
- **Event Management**: Create and manage events with customizable parameters
- **Access Control**: Role-based permissions for admins and event organizers
- **Supply Control**: Set maximum ticket supply per event (or unlimited)
- **Ticket Revocation**: Organizers can revoke tickets when necessary
- **Metadata Support**: IPFS integration for rich ticket metadata
- **Transfer Support**: Tickets can be transferred between users
- **Comprehensive Testing**: Full test suite covering all functionality

## 🏗️ Architecture

### Smart Contract Features

- **ERC-721 Compliant**: Full NFT standard implementation
- **Role-Based Access**: Using OpenZeppelin's AccessControl
- **Event System**: Structured event creation and management
- **Supply Management**: Configurable ticket limits per event
- **Metadata Flexibility**: Support for both IPFS URIs and base URIs

### Key Components

- `EventTicketing.sol` - Main contract handling events and tickets
- `deploy.js` - Deployment script with optional event creation
- `Lock.js` - Comprehensive test suite
- `hardhat.config.js` - Hardhat configuration for development

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/amlesh-kumar01/NFT-Event-Ticketing.git
cd NFT-Event-Ticketing

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your private key and other settings
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Deployment
PRIVATE_KEY=your_private_key_here
TICKETS_NAME=Event Tickets
TICKETS_SYMBOL=ETIX
CONFIRMATIONS=5

# Optional: Create initial event on deployment
CREATE_INITIAL_EVENT=true
EVENT_NAME=Sample Concert
ORGANIZER=0x...
MAX_SUPPLY=100
BASE_URI=https://api.myevent.com/metadata/

# Optional: Contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests with gas reporting
npx hardhat test --reporter gas

# Run specific test file
npx hardhat test test/Lock.js
```

## 📦 Compilation & Deployment

### Compile Contracts

```bash
npm run compile
```

### Deploy to Local Network

```bash
# Start local Hardhat node
npm run node

# Deploy to local network (in another terminal)
npm run deploy:local
```

### Deploy to Core Testnet

```bash
# Deploy to Core testnet
npm run deploy
```

### Deploy to Other Networks

Update `hardhat.config.js` with your network configuration and run:

```bash
npx hardhat run scripts/deploy.js --network <network_name>
```

## 📋 Contract Usage

### For Administrators

```javascript
// Create a new event
await eventTicketing.createEvent(
  "Concert 2024",           // Event name
  organizerAddress,         // Organizer address
  1000,                     // Max supply (0 = unlimited)
  "https://api.com/meta/"   // Base URI for metadata
);
```

### For Event Organizers

```javascript
// Mint tickets for an event
await eventTicketing.mintTicket(
  eventId,                  // Event ID
  buyerAddress,             // Ticket recipient
  "ipfs://QmHash..."        // Optional: specific token URI
);

// Update event details
await eventTicketing.updateEvent(
  eventId,
  "Updated Event Name",
  2000,                     // New max supply
  "https://new-api.com/",   // New base URI
  true                      // Active status
);

// Revoke a ticket
await eventTicketing.revokeTicket(tokenId);
```

### For Ticket Holders

```javascript
// Transfer ticket to another user
await eventTicketing.transferFrom(
  fromAddress,
  toAddress,
  tokenId
);

// Check ticket metadata
const tokenURI = await eventTicketing.tokenURI(tokenId);
const eventId = await eventTicketing.ticketEvent(tokenId);
```

## 🔧 Contract Interface

### Main Functions

| Function | Description | Access |
|----------|-------------|---------|
| `createEvent()` | Create a new event | Admin only |
| `updateEvent()` | Update event details | Admin/Organizer |
| `mintTicket()` | Mint a ticket for an event | Admin/Organizer |
| `revokeTicket()` | Revoke (burn) a ticket | Admin/Organizer |
| `setTokenURI()` | Set custom token URI | Admin/Organizer |
| `totalEvents()` | Get total number of events | Public |
| `totalTickets()` | Get total minted tickets | Public |

### Events

- `EventCreated(eventId, name, organizer, maxSupply)`
- `EventUpdated(eventId)`
- `TicketMinted(eventId, tokenId, to, tokenURI)`
- `TicketRevoked(tokenId, eventId)`

## 🛡️ Security Features

- **Role-based access control** using OpenZeppelin's AccessControl
- **Input validation** for all functions
- **Supply limit enforcement** to prevent overselling
- **Safe minting and burning** with proper state updates
- **Event-based logging** for transparency
- **Comprehensive test coverage** for edge cases

## 🌐 Network Support

Currently configured for:
- **Core Testnet** (Chain ID: 1114)
- **Local Hardhat Network**
- Easily extensible to other EVM-compatible networks

## 📁 Project Structure

```
NFT-Event-Ticketing/
├── contracts/
│   └── EventTicketing.sol      # Main smart contract
├── scripts/
│   └── deploy.js              # Deployment script
├── test/
│   └── Lock.js                # Test suite
├── hardhat.config.js          # Hardhat configuration
├── package.json               # Project dependencies
└── README.md                  # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔮 Future Enhancements

- [ ] Frontend web application
- [ ] Mobile app integration
- [ ] Secondary market functionality
- [ ] Dynamic pricing mechanisms
- [ ] Multi-signature organizer support
- [ ] Batch minting capabilities
- [ ] Ticket resale restrictions
- [ ] Integration with external ticketing platforms

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/amlesh-kumar01/NFT-Event-Ticketing/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

## 🙏 Acknowledgments

- [OpenZeppelin](https://openzeppelin.com/) for secure smart contract libraries
- [Hardhat](https://hardhat.org/) for development environment
- [Ethers.js](https://ethers.org/) for Ethereum interaction
- The amazing blockchain community for inspiration and support

---

**Built with ❤️ for the future of event ticketing**
