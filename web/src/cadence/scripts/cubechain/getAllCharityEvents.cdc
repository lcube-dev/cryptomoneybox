import Charity from 0x529290e4db075ecb

pub fun main(): [Charity.CharityDetails]  {
  let allEvents: [Charity.CharityDetails] = []
  for addr in Charity.creators {
    let cap = getAccount(addr).getCapability<&Charity.CharityEventCollection{Charity.CharityEventCollectionPublic}>(Charity.CharityEventCollectionPublicPath).borrow()!
    allEvents.appendAll(cap.getCharityEventsDetails().values)
  }

  return allEvents
}
