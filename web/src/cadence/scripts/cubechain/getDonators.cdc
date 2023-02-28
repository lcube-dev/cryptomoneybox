import Charity from 0x529290e4db075ecb

pub fun main(creatorAddr: Address, id: UInt64): [Charity.DonateBox]  {
    let cap = getAccount(creatorAddr).getCapability<&Charity.CharityEventCollection{Charity.CharityEventCollectionPublic}>
            (Charity.CharityEventCollectionPublicPath).borrow()!

    return cap.getDonators(id: id)
}

