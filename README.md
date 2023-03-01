 # <img src="https://user-images.githubusercontent.com/35562979/221948291-dccc65cb-7117-491e-95bd-8271dcda7bde.png" width="75" height="75">  CryptoMoneybox

👋 Welcome! This demo app is designed for fundraising on Flow.

CryptoMoneybox is a fundraising platform  demo application for social responsibility projects built with NodeJs and [Cadence](https://developers.flow.com/cadence).

 ## ✨ Getting Started

-------------

**1. Install Dependencies**

- 🛠 This project requires NodeJS v16.x or above. See: [Node installation instructions](https://nodejs.org/en/)
- 🛠 This project requires flow-cli v0.39.1 or above. See:[Flow CLI installation instructions](https://developers.flow.com/tools/flow-cli)

**2. Clone the project**
```javascript
git clone --depth=1 https://github.com/lcube-dev/cryptomoneybox.git
```
**3. Install packages**
- Run `npm install` in `/cryptomoneybox/web` folder.

 - Note: If you are using a Macintosh change dev value in package.json like below:
 
    `"dev": "next dev --port 3000 yarn generate--watch"`


**Local development**

 - Run this command to start CryptoMoneybox with the Flow local development suite:

     ```javascript 
     npm run dev
     ```

## Project Overview

-------------

![CryptoMoneybox](https://user-images.githubusercontent.com/126346134/221440383-991392f4-cfdd-44bd-b569-a8c758b5397a.png)

## 🔎 Legend

Above is a basic diagram of the parts of this project contained in each folder, and how each part interacts with the others.

1. Web App (Static website) | cryptomoneybox/web/app

   - This is a web application built with Nextjs that can connects directly to the Flow blockchain using `@onflow/fcl` and `Niftory API`. No servers required. `@onflow/fcl` and `Niftory API` handles authentication and authorization of Flow accounts, signing transactions, and querying data using using Cadence scripts.
  
2. Web Server               |  cryptomoneybox/web/src/pages/api
    
    - Cryptomoneybox use [Niftory API](https://github.com/Niftory) for backend web server.
    
3. Cadence Code             | cryptomoneybox/web/src/cadence

   - Cadence smart contracts, scripts & transactions for your viewing pleasure. This folder contains all of the blockchain logic for the fundraising application

## What is CryptoMoneybox?
The CryptoMoneybox project supports two types of fundraising campaigns:
1. Charity Campaign
    - Organizing a fundraising campaign with a CharityEvent resource
3. Aid Organization
    - Aid organizations model is a a platform that allows individuals and organizations to start a campaign quickly in case of any natural disaster.

## ❓ More Questions?
   - Chat with the team on the ChainCube [Discord server](https://discord.gg/pxEQq5xQph)

## Troubleshooting 

**Unblock ports**
   * CryptoMoneybox uses the following ports. Make sure they are not in use by another process
   * 3000: CryptoMoneybox web app
  
**Contracts Addresses**
   * Charity.cdc : [0xc26d1ec60d9fa66b](https://testnet.flowscan.org/account/0xd88639d8cf8291b9)  `Testnet` 
   * ChainCubeAid.cdc : [0x0d5e5c6c8bd04037](https://testnet.flowscan.org/account/0x0d5e5c6c8bd04037)   `Testnet`

-------------
