import Charity from 0xd88639d8cf8291b9
import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868
transaction (amount: UFix64, creatorAddr : Address, id: UInt64) {
  
  let pubCap: Capability<&Charity.CharityEventCollection{Charity.CharityEventCollectionPublic}>
  let vaultRef: &FungibleToken.Vault

  prepare(acct: AuthAccount) {
    log("start")
    let creatorAcc = getAccount(creatorAddr)
    self.pubCap = creatorAcc.getCapability<&Charity.CharityEventCollection{Charity.CharityEventCollectionPublic}>(Charity.CharityEventCollectionPublicPath)

    self.vaultRef = acct.borrow<&FungibleToken.Vault>(from: /storage/flowTokenVault)
			?? panic("Could not borrow reference to the owner's Vault!")
    
  }

  execute{
    log("bef donate")
    self.pubCap.borrow()?.donate(id: id, amount: amount, senderVaultRef: self.vaultRef)
  }
    
}
