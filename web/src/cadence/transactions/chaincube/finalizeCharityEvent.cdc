import Charity from 0x529290e4db075ecb

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
