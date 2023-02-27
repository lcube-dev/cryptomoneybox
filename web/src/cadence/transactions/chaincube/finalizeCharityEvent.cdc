import Charity from 0xd88639d8cf8291b9

transaction (id: UInt64) {

  let privCap: Capability<&Charity.CharityEventCollection{Charity.CharityEventCollectionPrivate}>

  prepare(acct: AuthAccount) {
    self.privCap = acct.getCapability<&Charity.CharityEventCollection{Charity.CharityEventCollectionPrivate}>
                    (Charity.CharityEventCollectionPrivatePath)
  }

  execute{
    self.privCap.borrow()?.finalizeEvent(id: id)
  }

}
