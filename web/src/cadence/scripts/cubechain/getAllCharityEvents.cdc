import Charity from 0xc26d1ec60d9fa66b

pub fun main(): [Charity.CharityDetails]  {
  let allEvents: [Charity.CharityDetails] = []
  for addr in Charity.creators {
    let cap = getAccount(addr).getCapability<&Charity.CharityEventCollection{Charity.CharityEventCollectionPublic}>(Charity.CharityEventCollectionPublicPath).borrow()!
    allEvents.appendAll(cap.getCharityEventsDetails().values)
  }

  return allEvents
}
