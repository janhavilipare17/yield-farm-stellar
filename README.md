#  Yield Farm on Stellar

A production-ready yield farming dApp built on Stellar Soroban smart contracts with inter-contract calls, custom token, real-time event streaming, and CI/CD pipeline.

## 🔗 Live Demo
[https://yield-farm-stellar-8uv3.vercel.app](https://yield-farm-stellar-8uv3.vercel.app)

##  Demo Video
[ Watch Demo on Google Drive](https://drive.google.com/file/d/12LNzXHcoD-5rcoHpKG0PXsYWcDJHFtJU/view?usp=drive_link)

##  Screenshots

### Mobile Responsive View
![Mobile View](./screenshots/mobile.png)

### Staking Page
![Staking Page](./screenshots/staking.png)

### CI/CD Pipeline
![CI/CD Pipeline](https://github.com/janhavilipare17/yield-farm-stellar/actions/workflows/ci.yml/badge.svg)

##  Contract Addresses & Transaction Hashes

### Token Contract (FARM Token)
- **Address:** `CAIBAOAMQCILYEI3LTM3DUK3G3DA3Q3FG7ON4FBFKOFF7EV46GAKZTWU`
- **Deploy TX:** `aa876f2f2b60e1034c9a9ba51e8beca057d0b4f958c46bd8893430142c13197b`
- **Explorer:** [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CAIBAOAMQCILYEI3LTM3DUK3G3DA3Q3FG7ON4FBFKOFF7EV46GAKZTWU)

### Staking Contract
- **Address:** `CDK43XOUACVO327NBOWCMYVJ7BDMZ6KNISUA7JOF3UA3F2QH6OJIQ2E4`
- **Deploy TX:** `3889afc6958acfc69f56ecefbc58860d5831c35f0b751e330d74f7283d2acae1`
- **Explorer:** [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CDK43XOUACVO327NBOWCMYVJ7BDMZ6KNISUA7JOF3UA3F2QH6OJIQ2E4)

### Inter-Contract Call
The staking contract calls the token contract's `transfer()` function when:
- User stakes tokens → token.transfer(user → staking_contract)
- User unstakes → token.transfer(staking_contract → user)
- User claims rewards → token.transfer(staking_contract → user)

##  Custom Token
- **Token Name:** Farm Token
- **Symbol:** FARM
- **Decimals:** 7
- **Contract:** `CAIBAOAMQCILYEI3LTM3DUK3G3DA3Q3FG7ON4FBFKOFF7EV46GAKZTWU`
- **Network:** Stellar Testnet

##  Tech Stack
- **Smart Contracts:** Rust + Soroban SDK v22
- **Frontend:** Next.js 16 + Tailwind CSS
- **Wallet:** Freighter
- **Network:** Stellar Testnet
- **CI/CD:** GitHub Actions → Vercel

##  Features
-  Custom FARM token (SEP-41 compatible)
-  Staking contract with inter-contract calls to token contract
-  Real-time event streaming from Soroban contracts
-  Stake, Unstake, Claim Rewards functionality
-  Freighter wallet integration
-  Mobile responsive UI
-  CI/CD pipeline (GitHub Actions)
-  Deployed on Vercel

##  Project Structure
```
yield-farm-stellar/
├── contracts/
│   ├── token/          ← FARM token contract (Rust)
│   └── staking/        ← Staking + rewards contract (Rust)
├── frontend/           ← Next.js + Tailwind CSS
│   ├── app/
│   │   ├── page.tsx        ← Landing page
│   │   ├── stake/          ← Stake/Unstake/Claim UI
│   │   └── dashboard/      ← Live event streaming
│   └── lib/
│       └── contracts.ts    ← Contract addresses config
└── .github/
    └── workflows/
        └── ci.yml      ← CI/CD pipeline
```

##  Run Locally
```bash
# Clone the repo
git clone https://github.com/janhavilipare17/yield-farm-stellar.git
cd yield-farm-stellar

# Install frontend dependencies
cd frontend
npm install
npm run dev

# Open http://localhost:3000
```

##  Build Contracts
```bash
# Token contract
cd contracts/token
stellar contract build

# Staking contract
cd contracts/staking
stellar contract build
```

##  Network
- **Network:** Stellar Testnet
- **RPC URL:** https://soroban-testnet.stellar.org
- **Passphrase:** Test SDF Network ; September 2015
