 # ![WhatsApp Image 2023-02-26 at 23 33 32](https://user-images.githubusercontent.com/126346134/221435741-22de6e5c-932b-4356-8c06-6aa901bdce34.jpg)  CryptoMoneybox

👋 Welcome! This demo app is designed for fundraising on Flow.

CryptoMoneybox is a fundraising platform  demo application for social responsibility projects built with NodeJs and [Cadence](https://developers.flow.com/cadence).

# ✨ Getting Started

**1. Install Dependencies**

- 🛠 This project requires NodeJS v16.x or above. See: [Node installation instructions](https://nodejs.org/en/)
- 🛠 This project requires flow-cli v0.39.1 or above. See:[Flow CLI installation instructions](https://developers.flow.com/tools/flow-cli)
- 🛠 This project requires Python v3.6 or above. See: [Python installation instructions](https://www.python.org/downloads/)

**2. Clone the project**
```javascript
git clone --depth=1 https://github.com/lcube-dev/cryptomoneybox.git
```
**3. Install packages**
- Run `npm install --save-dev cross-env` in the root of the project.

# Local development
Run this command to start CryptoMoneybox with the Flow local development suite:

```javascript 
npm run dev
```

# Project Overview

![CryptoMoneybox](https://user-images.githubusercontent.com/126346134/221440383-991392f4-cfdd-44bd-b569-a8c758b5397a.png)

# 🔎 Legend

Above is a basic diagram of the parts of this project contained in each folder, and how each part interacts with the others.

1. Web App (Static website) | cryptoMoneybox/web
2. Web Server! | cryptoMoneybox/api
3. Cadence Code | cryptoMoneybox/cadence
   Cadence smart contracts, scripts & transactions for your viewing pleasure. This folder contains all of the blockchain logic for the marketplace application.
   
# What are CryptoMoneybox?
The CryptoMoneybox project supports two types of fundraising campaigns:
1. Fundraisin Campaign
    - Organizing a fundraising campaign with a CharityEvent resource
3. Aid Organization
    - Aid organizations model is a a platform that allows individuals and organizations to start a campaign quickly in case of any natural disaster.

# ❓ More Questions?
  - Chat with the team on the ChainCube [Discord server](https://discord.gg/pxEQq5xQph)

# Troubleshooting
**Rebuild dependencies**
  - If you change `node` versions on your system, you'll need to cd into the `web` and `api` directory and run `npm rebuild` to rebuild you dependencies for the new version.

 **Finding the logs**
  - You can see what processes have been started, and if they are online using `pm2 list`
  - You can tail logs for individual processes using `pm2 logs [process name]`. eg., `pm2 logs api` or `pm2 logs web`
  - You can tail all logs in the same terminal using `pm2 logs`

**Unblock ports**
  * CryptoMoneybox uses the following ports. Make sure they are not in use by another process
  * 3000: CryptoMoneybox web app
