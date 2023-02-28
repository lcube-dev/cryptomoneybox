import Charity from 0xc26d1ec60d9fa66b

pub fun main(creatorAddr: Address, id: UInt64): {Address:UFix64}  {
    let cap = getAccount(creatorAddr).getCapability<&Charity.CharityEventCollection{Charity.CharityEventCollectionPublic}>
            (Charity.CharityEventCollectionPublicPath).borrow()!

    return cap.getDonators(id: id)
}
