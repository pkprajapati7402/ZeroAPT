# ZeroAPT 🚀  
Seamless Aptos dApps, Zero Gas for Users  

## 📌 Overview  
AptosGasless is a POC project that abstracts away gas fees in Aptos dApps.  
Instead of making users pay for every interaction, they simply **sign an intent**, and a funded **relayer account** submits the transaction to the Aptos blockchain.  

This makes the Web3 experience **as smooth as Web2**, helping onboard new users without the friction of crypto fees.  

---

## ✨ Features  
- 🔹 **Gasless NFT Minting** → Users can mint event badge NFTs with zero gas.  
- 🔹 **Gasless Poll Voting** → Users vote on-chain without holding any APT.  
- 🔹 **Gasless Token Transfer** → Users can send test tokens without fees.  
- 🔹 **Relayer Dashboard** → Shows relayer account balance, last transactions, and total gas spent.  
- 🔹 **Modern UI** → React + Tailwind dashboard with smooth design and live transaction status.  

---

## 🏗️ Architecture  
1. **Frontend (React + Tailwind)**  
   - Connect wallet (Petra/Martian).  
   - User signs intent (mint, vote, transfer).  
   - Sends `{payload, signature}` to backend.  

2. **Backend (Node.js + Express)**  
   - Verifies signature & intent.  
   - Relayer submits transaction to Aptos Testnet.  
   - Tracks relayer account balance + nonce usage.  

3. **Smart Contract (Move on Aptos)**  
   - Functions for NFT mint, poll voting, and token transfer.  
   - Deployed on Aptos Testnet.  

---

## ⚡ Tech Stack  
- **Blockchain:** Aptos (Testnet)  
- **Smart Contract:** Move  
- **Backend:** Node.js, Express, Aptos SDK  
- **Frontend:** React, TailwindCSS  
- **Wallets:** Petra, Martian (via `@aptos-labs/wallet-adapter`)  

---

## 🚀 Getting Started  

### 1. Clone the repo  
```bash
git clone https://github.com/your-username/aptos-gasless.git
cd aptos-gasless
