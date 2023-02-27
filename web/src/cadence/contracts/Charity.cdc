import FungibleToken from 0x9a0766d93b6608b7

access(all) contract Charity {
    access(all) var creators: [Address]
    access(all) var totalEventCount: UInt64
    access(all) let CharityEventCollectionPublicPath: PublicPath 
    access(all) let CharityEventCollectionPrivatePath: PrivatePath
    access(all) let CharityEventCollectionStoragePath: StoragePath

    access(all) struct CharityDetails{
        pub(set) var id: UInt64
        pub let name: String
        pub let desc: String
        pub let sDate: UFix64
        pub(set) var eDate: UFix64
        pub let targetAmount: UFix64
        pub let creatorAddr: Address
        pub let donatedAddr: Address
        pub let nftMetadata: {String:String}
        pub(set) var maxDonatorAddrs: String
        pub(set) var maxDonationAmount: UFix64
        pub(set) var totalDonationAmount: UFix64
        pub(set) var donationCount: UInt64

        init(name: String,
            desc: String,
            eDate: UFix64,
            targetAmount: UFix64,
            creatorAddr: Address,
            donatedAddr : Address,
            nftMetadata: {String:String}
            ){
            self.id = 0
            self.name = name
            self.desc = desc
            self.sDate = getCurrentBlock().timestamp
            self.eDate = eDate
            self.targetAmount = targetAmount
            self.creatorAddr = creatorAddr
            self.donatedAddr = donatedAddr
            self.maxDonatorAddrs = ""
            self.maxDonationAmount = 0.0
            self.totalDonationAmount = 0.0
            self.donationCount = 0
            self.nftMetadata = nftMetadata
        }
    }

    access (all) resource CharityEvent {
        access (all) let id: UInt64
        access (all) let details: CharityDetails
        access (all) let targetVaultRef: Capability<&{FungibleToken.Receiver}>
        //access (all) let prizeNFT: @NonFungibleToken.NFT // this nft will be sent to maxDonator when the is event finalized


        pub fun getDetails () : CharityDetails {
            return self.details
        }

        pub fun isExpired() : Bool {
            if getCurrentBlock().timestamp > self.details.eDate {
                return true
            } else {
                return false
            }
        }

        pub fun isFull() : Bool {
            if self.getDetails().totalDonationAmount >= self.getDetails().targetAmount {
                return true
            } else {
                return false
            }
        }


        pub fun donate(amount: UFix64, senderVaultRef: &FungibleToken.Vault) {
            if self.isExpired() {
                panic("Charity event has been expired!")
            }
            if self.isFull() {
                panic("Charity's target amount has been reached!")
            }
            //let senderRef = senderCap.borrow()?? panic("Could not borrow receiver reference to the donator's Vault")
            //let sentVault: @FungibleToken.Vault <- senderRef.withdraw(amount: amount)
            let donator: Address = senderVaultRef.owner?.address!
            let recRef = self.targetVaultRef.borrow()?? panic("Could not borrow receiver reference to the recipient's Vault")
            let sentVault: @FungibleToken.Vault <- senderVaultRef.withdraw(amount: amount)
            recRef.deposit(from: <- sentVault)

            self.details.donationCount = self.details.donationCount + 1
            self.details.totalDonationAmount = self.details.totalDonationAmount + amount
            
            if amount > self.details.maxDonationAmount {
                self.details.maxDonationAmount = amount
                self.details.maxDonatorAddrs = donator.toString()
            }
            
        }
        


        init(details: CharityDetails,
            targetVaultRef: Capability<&{FungibleToken.Receiver}>) {
            self.id = Charity.totalEventCount
            Charity.totalEventCount = Charity.totalEventCount + 1
            self.details = details
            self.targetVaultRef = targetVaultRef
        }
        
        destroy () {
        }
        
    }

    pub resource interface CharityEventCollectionPublic {
        pub fun getCharityEventsDetails() : {UInt64 : CharityDetails} 
        pub fun getCharityEventDetails(id: UInt64) : CharityDetails
        pub fun donate(id: UInt64, amount: UFix64, senderVaultRef: &FungibleToken.Vault)
    }

    pub resource interface CharityEventCollectionPrivate {
        pub fun createCharityEvent(name: String, 
                                    desc: String, 
                                    eDate: UFix64, 
                                    targetAmount: UFix64, 
                                    donatedAddr: Address,
                                    creatorAddr: Address,
                                    targetVaultRef: Capability<&{FungibleToken.Receiver}>,
                                    nftMetadata: {String:String})
    }


    pub resource CharityEventCollection : CharityEventCollectionPublic, CharityEventCollectionPrivate {
        access (account) var charityEvents: @{UInt64 : CharityEvent}

        pub fun getCharityEventsDetails() : {UInt64 : CharityDetails} {
            let details: {UInt64 : CharityDetails} = {}

            for id in self.charityEvents.keys {
                let eventRef = &self.charityEvents[id] as &CharityEvent?
                details[id] = eventRef?.getDetails()
            }
            return details
        }
        
        pub fun getCharityEventDetails(id: UInt64) : CharityDetails {
             return self.charityEvents[id]?.getDetails()!
        }

        pub fun donate(id: UInt64, amount: UFix64, senderVaultRef: &FungibleToken.Vault) {
            self.charityEvents[id]?.donate(amount: amount, senderVaultRef: senderVaultRef)
        }

        pub fun createCharityEvent(name: String, 
                                desc: String, 
                                eDate: UFix64, 
                                targetAmount: UFix64, 
                                donatedAddr: Address,
                                creatorAddr: Address,
                                targetVaultRef: Capability<&{FungibleToken.Receiver}>,
                                nftMetadata: {String:String}){
        
            let details: CharityDetails = CharityDetails(name: name,
                                                        desc: desc,
                                                        eDate: eDate,
                                                        targetAmount: targetAmount,
                                                        creatorAddr: creatorAddr,
                                                        donatedAddr: donatedAddr,
                                                        nftMetadata: nftMetadata)

            let charityEvent <- create CharityEvent(details: details,
                                            targetVaultRef: targetVaultRef)

            charityEvent.details.id = charityEvent.id
            self.charityEvents[charityEvent.id] <-! charityEvent
            if !Charity.creators.contains(creatorAddr) {
                Charity.creators.append(creatorAddr)
            }
        }

        pub fun finalizeEvent(id: UInt64) {
            //send prizeNFT to maxDonator
            var details: CharityDetails = self.charityEvents[id]?.details!
            details.eDate = getCurrentBlock().timestamp
        }

        
        init() {
            self.charityEvents <- {}
        }

        destroy() {
            destroy self.charityEvents
        }
    }

    pub fun createEmptyCharityEventCollection(): @CharityEventCollection{
        return <- create CharityEventCollection()
    }


    init() {
        self.totalEventCount = 0
        self.creators = []
        self.CharityEventCollectionPublicPath = /public/CharityEventCollectionPublic
        self.CharityEventCollectionPrivatePath = /private/CharityEventCollectionPrivate
        self.CharityEventCollectionStoragePath = /storage/CharityEventCollectionStorage
    } 
}
