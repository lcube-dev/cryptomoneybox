import Charity from 0xd88639d8cf8291b9

pub fun main(): [Charity.CharityDetails]  {
  let allEvents: [Charity.CharityDetails] = []
  for addr in Charity.creators {
    let cap = getAccount(addr).getCapability<&Charity.CharityEventCollection{Charity.CharityEventCollectionPublic}>(Charity.CharityEventCollectionPublicPath).borrow()!
    allEvents.appendAll(cap.getCharityEventsDetails().values)
  }

  return allEvents
}
