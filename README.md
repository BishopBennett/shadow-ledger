# Shadow Ledger - Privacy-Preserving Bill Recording dApp

A decentralized application (dApp) built with FHEVM (Fully Homomorphic Encryption Virtual Machine) that enables users to record and manage bills with encrypted amounts while maintaining privacy. The application uses homomorphic encryption to perform computations on encrypted data without decrypting it.

## Features

- 🔒 **Encrypted Storage**: Bill amounts are encrypted using FHEVM technology
- 📊 **Statistics Dashboard**: View aggregated statistics and charts of spending
- 🔐 **Privacy First**: Only you can decrypt and view your private bill data
- 📈 **Category Analysis**: Track spending by category with visual charts
- 🌐 **Multi-Network Support**: Deployed on Sepolia testnet and local Hardhat network

## Project Structure

```
zama_shadow_ledger/
├── fhevm-hardhat-template/    # Smart contracts and Hardhat configuration
│   ├── contracts/             # Solidity smart contracts
│   ├── deploy/                # Deployment scripts
│   ├── test/                  # Contract tests
│   └── hardhat.config.ts      # Hardhat configuration
└── shadow-ledger-frontend/    # Next.js frontend application
    ├── app/                   # Next.js app directory
    ├── components/            # React components
    ├── hooks/                 # Custom React hooks
    ├── fhevm/                 # FHEVM integration code
    └── abi/                   # Contract ABIs and addresses
```

## Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Package manager
- **MetaMask**: Browser extension for wallet connection
- **Hardhat**: For local development and testing

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd zama_shadow_ledger
```

### 2. Install dependencies

**Smart Contracts (Hardhat):**
```bash
cd fhevm-hardhat-template
npm install
```

**Frontend:**
```bash
cd ../shadow-ledger-frontend
npm install
```

### 3. Set up environment variables

**Hardhat configuration:**
```bash
cd fhevm-hardhat-template
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
npx hardhat vars set ETHERSCAN_API_KEY  # Optional
```

## Development

### Smart Contracts

**Compile contracts:**
```bash
cd fhevm-hardhat-template
npm run compile
```

**Run tests:**
```bash
npm run test
```

**Deploy to local network:**
```bash
# Start local Hardhat node
npx hardhat node

# In another terminal, deploy contracts
npx hardhat deploy --network localhost
```

**Deploy to Sepolia testnet:**
```bash
npx hardhat deploy --network sepolia --tags ShadowLedger
```

### Frontend

**Generate ABI and addresses:**
```bash
cd shadow-ledger-frontend
npm run genabi
```

**Run in mock mode (local development):**
```bash
npm run dev:mock
```

**Run in production mode (with real Relayer SDK):**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

## Deployment

### Smart Contracts

The ShadowLedger contract is deployed on Sepolia testnet:
- **Contract Address**: `0xC0370Aa088BF5F60DA531971669F8ED92b581F16`
- **Network**: Sepolia (Chain ID: 11155111)
- **Explorer**: [Etherscan](https://sepolia.etherscan.io/address/0xC0370Aa088BF5F60DA531971669F8ED92b581F16)

### Frontend

The frontend is deployed on Vercel:
- **Production URL**: https://shadow-ledger-a64q9nots8s.vercel.app
- **Status**: Live and ready for use

## Usage

1. **Connect Wallet**: Click "Connect Wallet" and approve the MetaMask connection
2. **Switch Network**: Ensure you're connected to Sepolia testnet or Hardhat localhost
3. **Create Bill**: Fill in the bill form with amount, category, and description
4. **View Bills**: See your encrypted bills in the list
5. **Decrypt Bills**: Click "Decrypt" to view individual bill amounts
6. **View Statistics**: Check the statistics dashboard for aggregated spending data

## Technology Stack

### Smart Contracts
- **Solidity**: ^0.8.27
- **FHEVM Solidity**: ^0.9.1
- **Hardhat**: ^2.26.0
- **Ethers.js**: ^6.15.0

### Frontend
- **Next.js**: ^15.4.2 (with static export)
- **React**: ^19.1.0
- **TypeScript**: ^5
- **Tailwind CSS**: ^3.4.1
- **Recharts**: ^2.12.7
- **FHEVM Relayer SDK**: ^0.3.0-5

## FHEVM Integration

This project uses FHEVM (Fully Homomorphic Encryption Virtual Machine) to enable:
- Encrypted data storage (`euint64` types)
- Homomorphic operations (addition, subtraction)
- Client-side decryption with user signatures
- Privacy-preserving aggregation

## Security Considerations

- All bill amounts are encrypted on-chain using FHEVM
- Only the bill creator can decrypt their own bills
- Decryption requires a valid EIP-712 signature
- Public keys and parameters are stored in IndexedDB
- Decryption signatures are persisted for convenience

## License

BSD-3-Clause-Clear

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

- [Zama](https://zama.ai/) for FHEVM technology
- [FHEVM Hardhat Template](https://github.com/zama-ai/fhevm-hardhat-template) for the base structure


