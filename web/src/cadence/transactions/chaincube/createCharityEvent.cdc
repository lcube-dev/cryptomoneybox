import Charity from 0xc26d1ec60d9fa66b
import FungibleToken from 0x9a0766d93b6608b7

transaction (name: String, desc: String, eDate: UFix64, targetAmount: UFix64, donatedAddr: Address, nftMetadata: {String:String}) {
  
  let privCap: Capability<&Charity.CharityEventCollection{Charity.CharityEventCollectionPrivate}>
  let creatorAddr: Address
  let targetVaultRef: Capability<&{FungibleToken.Receiver}>

  prepare(acct: AuthAccount) {
    let targetAcc = getAccount(donatedAddr)
    self.targetVaultRef = getAccount(donatedAddr)
            .getCapability<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
    
    self.creatorAddr = acct.address
    if acct.borrow<&Charity.CharityEventCollection>(from: Charity.CharityEventCollectionStoragePath) == nil {
      let emptyCol <- Charity.createEmptyCharityEventCollection()
      acct.save(<- emptyCol, to: Charity.CharityEventCollectionStoragePath)
      acct.link<&Charity.CharityEventCollection{Charity.CharityEventCollectionPublic}>
                (Charity.CharityEventCollectionPublicPath, target: Charity.CharityEventCollectionStoragePath)
      self.privCap = acct.link<&Charity.CharityEventCollection{Charity.CharityEventCollectionPrivate}>
                (Charity.CharityEventCollectionPrivatePath, target: Charity.CharityEventCollectionStoragePath)!
    } else {
      self.privCap = acct.getCapability<&Charity.CharityEventCollection{Charity.CharityEventCollectionPrivate}>
                (Charity.CharityEventCollectionPrivatePath)

    }

  }

  execute{
    self.privCap.borrow()?.createCharityEvent(name: name, 
                                                                  desc: desc, 
                                                                  eDate: eDate, 
                                                                  targetAmount: targetAmount,
                                                                  donatedAddr: donatedAddr,
                                                                  creatorAddr: self.creatorAddr, 
                                                                  targetVaultRef: self.targetVaultRef,
                                                                  nftMetadata: nftMetadata)
  }
    
}
