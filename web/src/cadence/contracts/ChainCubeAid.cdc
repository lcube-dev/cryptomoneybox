
import NonFungibleToken from 0x631e88ae7f1d7c20
import MetadataViews from 0x631e88ae7f1d7c20

//Wow! You are viewing ChainCubeAid NFT token contract.
pub contract ChainCubeAid: NonFungibleToken {

  pub var totalSupply: UInt64

  pub let CollectionStoragePath: StoragePath
  pub let CollectionPublicPath: PublicPath
  pub let MinterStoragePath: StoragePath
  pub let MinterPublicPath: PublicPath

  pub event ContractInitialized()
  pub event Withdraw(id: UInt64, from: Address?)
  pub event Deposit(id: UInt64, to: Address?)
  pub event Mint(id: UInt64, setID: UInt64, creator: Address, metadata: {String:String})
  pub event Destroy(id: UInt64)

  pub event SetCreated(setID: UInt64, creator: Address, metadata: {String:String})
  pub event NFTAddedToSet(setID: UInt64, nftID: UInt64)
  pub event NFTRetiredFromSet(setID: UInt64, nftID: UInt64)
  pub event SetLocked(setID: UInt64)

    /*
    We are creating minter here.
    If accounts want to mint an NFT, they have to create SET.
    NBATopshot stored their SET in contract. But we do not want that way. Because if we want to move our contract, stored sets moving method is hard.
    We are stored set in account storage. This is so simple and if we want to move another address, it's so easy.
    We privent the contract store outgoings.
    */
   pub fun createMinter(creator: Address, metadata: {String:String}): @NFTMinter {
    assert(metadata.containsKey("setName"), message: "setName property is required for ChainCubeAidSet!")
    assert(metadata.containsKey("thumbnail"), message: "thumbnail property is required for ChainCubeAidSet!")

    var setName = self.clearSpaceLetter(text: metadata["setName"]!)

    assert(setName.length>2, message: "setName property is not empty or minimum 3 characters!")

    let storagePath= "ChainCubeAidSet_".concat(setName)

    let candidate <- self.account.load<@ChainCubeAidSet>(from: StoragePath(identifier: storagePath)!)

    if candidate!=nil {
        panic(setName.concat(" ChainCubeAidSet already created before!"))
    }

    destroy candidate

    var newSet <- create ChainCubeAidSet(creatorAddress: creator, metadata: metadata)
    var setID: UInt64 = newSet.uuid
    emit SetCreated(setID: setID, creator: creator, metadata: metadata)

    self.account.save(<-newSet, to: StoragePath(identifier: storagePath)!)

    return <- create NFTMinter(setID: setID)
  }

    /*
    Accounts getting their SET information
    We created this method only demonstration.
    If you want to get collection use event listener on blockchain and then save collection to your database
    Get collection from your database with api
    */
  pub fun borrowSet(setName: String): &ChainCubeAidSet {
     return self.account.borrow<&ChainCubeAidSet>(from: StoragePath(identifier: "ChainCubeAidSet_".concat(setName))!)!
  }

  /*
  We are clearing space character, because storage path does not want spaces
  */
  pub fun clearSpaceLetter(text: String): String {
    var collectionName=""
    var i = 0
    while i < text.length {
        if text[i] != " " {
           collectionName=collectionName.concat(text[i].toString())
        }else{
            collectionName=collectionName.concat("_")
        }
      i = i + 1
    }
    return collectionName
  }

  pub resource ChainCubeAidSet {
    pub let creatorAddress: Address
    pub let metadata: {String:String}

    init(creatorAddress: Address, metadata: {String:String}) {
         self.creatorAddress = creatorAddress
         self.metadata = metadata
        }
  }


  pub resource NFT: NonFungibleToken.INFT, MetadataViews.Resolver {

    pub let id: UInt64
    pub let setID: UInt64

    pub let creator: Address
    pub let metadata: {String:String}
    access(self) let royalties: [MetadataViews.Royalty]

       init(id: UInt64, setID:UInt64, creator: Address, metadata: {String:String}, royalties: [MetadataViews.Royalty]) {
            self.id = id
            self.setID = setID
            self.creator = creator
            self.royalties = royalties
            self.metadata = metadata
        }

        pub fun getViews(): [Type] {
            return [
                Type<MetadataViews.Display>(),
                Type<MetadataViews.Royalties>(),
                Type<MetadataViews.Editions>(),
                Type<MetadataViews.ExternalURL>(),
                Type<MetadataViews.NFTCollectionData>(),
                Type<MetadataViews.NFTCollectionDisplay>(),
                Type<MetadataViews.Serial>(),
                Type<MetadataViews.Traits>()
            ]
        }

        pub fun resolveView(_ view: Type): AnyStruct? {
            switch view {
                case Type<MetadataViews.Display>():
                    return MetadataViews.Display(
                         name: self.metadata["name"] ?? "",
                        description: self.metadata["description"] ?? "",
                        thumbnail: MetadataViews.HTTPFile(url: self.metadata["thumbnail"] ?? ""),
                    )
                case Type<MetadataViews.Editions>():
                    // There is no max number of NFTs that can be minted from this contract
                    // so the max edition field value is set to nil
                    let editionInfo = MetadataViews.Edition(name: "ChainCubeAid NFT Edition", number: self.id, max: nil)
                    let editionList: [MetadataViews.Edition] = [editionInfo]
                    return MetadataViews.Editions(
                        editionList
                    )
                case Type<MetadataViews.Serial>():
                    return MetadataViews.Serial(
                        self.id
                    )
                case Type<MetadataViews.Royalties>():
                    return MetadataViews.Royalties(
                        self.royalties
                    )
                case Type<MetadataViews.ExternalURL>():
                    return MetadataViews.ExternalURL("https://chaincube.com/".concat(self.id.toString()))
                case Type<MetadataViews.NFTCollectionData>():
                    return MetadataViews.NFTCollectionData(
                        storagePath: ChainCubeAid.CollectionStoragePath,
                        publicPath: ChainCubeAid.CollectionPublicPath,
                        providerPath: /private/ChainCubeAidCollection,
                        publicCollection: Type<&ChainCubeAid.Collection{ChainCubeAidCollectionPublic}>(),
                        publicLinkedType: Type<&ChainCubeAid.Collection{ChainCubeAid.ChainCubeAidCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Receiver,MetadataViews.ResolverCollection}>(),
                        providerLinkedType: Type<&ChainCubeAid.Collection{ChainCubeAid.ChainCubeAidCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Provider,MetadataViews.ResolverCollection}>(),
                        createEmptyCollectionFunction: (fun (): @NonFungibleToken.Collection {
                            return <-ChainCubeAid.createEmptyCollection()
                        })
                    )
                case Type<MetadataViews.NFTCollectionDisplay>():
                    let media = MetadataViews.Media(
                        file: MetadataViews.HTTPFile(
                            url: "https://chaincube.com/images/logo.svg"
                        ),
                        mediaType: "image/svg+xml"
                    )
                    return MetadataViews.NFTCollectionDisplay(
                        name: "The ChainCubeAid Collection",
                        description: "This collection is used as an chaincube to help you develop your next Flow NFT.",
                        externalURL: MetadataViews.ExternalURL("https://chaincube.com"),
                        squareImage: media,
                        bannerImage: media,
                        socials: {
                            "twitter": MetadataViews.ExternalURL("https://twitter.com/chaincube")
                        }
                    )
                case Type<MetadataViews.Traits>():
                    let excludedTraits = ["name", "description","thumbnail","uri"]
                    let traitsView = MetadataViews.dictToTraits(dict: self.metadata, excludedNames: excludedTraits)

                    return traitsView

            }
            return nil
        }


        pub fun getMetadata(): {String:String} {
            return self.metadata
        }

        pub fun getRoyalties(): [MetadataViews.Royalty] {
            return self.royalties
        }

        destroy() {
            emit Destroy(id: self.id)
        }
  }

    pub resource interface ChainCubeAidCollectionPublic {
        pub fun deposit(token: @NonFungibleToken.NFT)
        pub fun getIDs(): [UInt64]
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
        pub fun borrowChainCubeAid(id: UInt64): &ChainCubeAid.NFT? {
            post {
                (result == nil) || (result?.id == id):
                    "Cannot borrow ChainCubeAid reference: The ID of the returned reference is incorrect"
            }
        }
    }

    pub resource Collection: ChainCubeAidCollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection {
        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        init () {
            self.ownedNFTs <- {}
        }

        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("Missing NFT")
            emit Withdraw(id: token.id, from: self.owner?.address)
            return <-token
        }

        pub fun deposit(token: @NonFungibleToken.NFT) {
            let token <- token as! @ChainCubeAid.NFT

            let id: UInt64 = token.id
            let oldToken <- self.ownedNFTs[id] <- token
            destroy oldToken
            emit Deposit(id: id, to: self.owner?.address)
        }

        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            return (&self.ownedNFTs[id] as &NonFungibleToken.NFT?)!
        }

        pub fun borrowChainCubeAid(id: UInt64): &ChainCubeAid.NFT? {
          if self.ownedNFTs[id] != nil {
             let ref = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
             return ref as! &ChainCubeAid.NFT
          } else {
               return nil
           }
        }

        pub fun borrowViewResolver(id: UInt64): &AnyResource{MetadataViews.Resolver} {
            let nft = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
            let refItem = nft as! &ChainCubeAid.NFT
            return refItem;
        }

        pub fun borrow(id: UInt64): &NFT? {
            let ref = &self.ownedNFTs[id] as auth &NonFungibleToken.NFT?
            return ref as! &ChainCubeAid.NFT
        }

        pub fun getMetadata(id: UInt64): {String:String} {
            let ref = &self.ownedNFTs[id] as auth &NonFungibleToken.NFT?
            return (ref as! &ChainCubeAid.NFT).getMetadata()
        }

        pub fun getRoyalties(id: UInt64): [MetadataViews.Royalty] {
            let ref = &self.ownedNFTs[id] as auth &NonFungibleToken.NFT?
            return (ref as! &ChainCubeAid.NFT).getRoyalties()
        }

        destroy() {
            destroy self.ownedNFTs
        }
    }

    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <- create Collection()
    }


    pub resource NFTMinter {

    access(self) let setID: UInt64
    init(setID: UInt64){
        self.setID=setID
    }


    /*
    We set access modifiers private, because we do not want to accounts create only one nft
    */

    priv fun mintNFT(creator: Capability<&{NonFungibleToken.Receiver}>, metadata: {String:String}, royalties: [MetadataViews.Royalty]): @ChainCubeAid.NFT {

            var token <- create NFT(
                id: ChainCubeAid.totalSupply,
                setID: self.setID,
                creator: creator.address,
                metadata: metadata,
                royalties: royalties
            )
            ChainCubeAid.totalSupply = ChainCubeAid.totalSupply + 1

            emit Mint(id: token.id,setID:self.setID, creator: creator.address, metadata: metadata)

            return <- token
    }

    /*
        Accounts NFT creating rules.
        Quantity is min 4
        Our another criterias.
    */

     pub fun batchCreateComponents(creator: Capability<&{NonFungibleToken.Receiver}>, metadata: {String:String}, royalties: [MetadataViews.Royalty], quantity: UInt8): @Collection {

         assert(quantity>4, message: "Quantity higher than 4 for ChainCubeAid!")
         assert(quantity<26, message: "Quantity lower than 26 for ChainCubeAid!")

         assert(metadata.containsKey("name"), message: "name property is required for ChainCubeAid!")
         assert(metadata.containsKey("description"), message: "description property is required for ChainCubeAid!")
         assert(metadata.containsKey("image"), message: "image property is required for ChainCubeAid!")

        let newCollection <- create Collection()

        var i: UInt8 = 0
        while i < quantity {
            newCollection.deposit(token: <-self.mintNFT(creator: creator, metadata: metadata, royalties: royalties))
            i = i + 1
        }

       return <-newCollection
        }
    }

    init() {

        self.totalSupply = 0
        self.CollectionStoragePath = /storage/ChainCubeAidCollection
        self.CollectionPublicPath = /public/ChainCubeAidCollection
        self.MinterPublicPath = /public/ChainCubeAidMinter
        self.MinterStoragePath = /storage/ChainCubeAidMinter

        let collection <- create Collection()
        self.account.save(<-collection, to: self.CollectionStoragePath)

        self.account.link<&ChainCubeAid.Collection{NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, ChainCubeAid.ChainCubeAidCollectionPublic, MetadataViews.ResolverCollection}>(ChainCubeAid.CollectionPublicPath, target: ChainCubeAid.CollectionStoragePath)

        emit ContractInitialized()
    }
}
