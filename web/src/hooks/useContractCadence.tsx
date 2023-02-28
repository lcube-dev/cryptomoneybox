import {useGraphQLQuery} from "graphql/useGraphQLQuery"
import {ContractDocument, ContractQuery, ContractQueryVariables} from "../../generated/graphql"

const nonFungibleTokenAddress = process.env.NEXT_PUBLIC_NFT_ADDRESS
const metadataViewsAddress = process.env.NEXT_PUBLIC_NFT_ADDRESS
const niftoryAddress = process.env.NEXT_PUBLIC_NIFTORY_ADDRESS
const registryAddress = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS
const clientId = process.env.NEXT_PUBLIC_CLIENT_ID

const TRANSFER_TOKEN = `import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868

transaction(amount: UFix64, to: Address) { 
    let sentVault: @FungibleToken.Vault 
    prepare(signer: AuthAccount) { 
        let vaultRef = signer.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault) ?? panic("Could not borrow reference to the owner's Vault!") 
        self.sentVault <- vaultRef.withdraw(amount: amount)
    }

    execute { 
        let receiverRef =  getAccount(to)
            .getCapability(/public/flowTokenReceiver)
            .borrow<&{FungibleToken.Receiver}>() ?? panic("Could not borrow receiver reference to the recipient's Vault") 
        receiverRef.deposit(from: <-self.sentVault)
    }
}`

const CREATE_SET_SCRIPT = `
import FungibleToken from 0x9a0766d93b6608b7
import NonFungibleToken from 0x631e88ae7f1d7c20
import MetadataViews from 0x631e88ae7f1d7c20
import ChainCubeAid from 0x0d5e5c6c8bd04037

transaction(
  metadata: {String:String}
  ) {

prepare(account: AuthAccount) {
  var storagePath = "ChainCubeAidSet_".concat(ChainCubeAid.clearSpaceLetter(text: metadata["setName"]!))

  var minter <- ChainCubeAid.createMinter(creator: account.address, metadata: metadata)
  account.save(<-minter, to: StoragePath(identifier: storagePath)!)
}

 execute {
   log("Minter Authorized")
 }
}
 `

const CREATE_BATCH_AND_SELL_SCRIPT = `
import FungibleToken from 0x9a0766d93b6608b7
import NonFungibleToken from 0x631e88ae7f1d7c20
import MetadataViews from 0x631e88ae7f1d7c20
import FlowToken from 0x7e60df042a9c0868
import NFTStorefrontV2 from 0x2d55b98eb200daef
import ChainCubeAid from 0x0d5e5c6c8bd04037


transaction(
    marketFeeAddress: Address,
    marketPlaceSaleCutPercentage: UFix64,
    recipient: Address,
    metadata: {String:String},
    royaltyBeneficiaries: [Address], 
    cuts: [UFix64],
    saleItemPrice: UFix64,
    customID: String,
    commissionAmount: UFix64,
    expiry: UInt64,
    quantity: UInt8
) {


    let ChainCubeAidCollection: &ChainCubeAid.Collection
    let minter: &ChainCubeAid.NFTMinter
    let mintReceiver: Capability<&{NonFungibleToken.Receiver}>
    let flowReceiver: Capability<&FlowToken.Vault{FungibleToken.Receiver}>
    let marketReceiver: Capability<&FlowToken.Vault{FungibleToken.Receiver}>
    let ChainCubeAidProvider: Capability<&ChainCubeAid.Collection{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>
    let storefront: &NFTStorefrontV2.Storefront
    var marketplacesCapability: [Capability<&AnyResource{FungibleToken.Receiver}>]
    var saleCuts: [NFTStorefrontV2.SaleCut]

    prepare(signer: AuthAccount) {   
    
        self.marketplacesCapability = []
           self.saleCuts = []


        // We need a provider capability, but one is not provided by default so we create one if needed.
        let ChainCubeAidCollectionProviderPrivatePath = /private/ChainCubeAidCollectionProvider

        self.flowReceiver = signer.getCapability<&FlowToken.Vault{FungibleToken.Receiver}>(/public/flowTokenReceiver)
        assert(self.flowReceiver.borrow() != nil, message: "Missing or mis-typed FLOW receiver")
        
        let marketAccount = getAccount(marketFeeAddress)
        self.marketReceiver = marketAccount.getCapability<&FlowToken.Vault{FungibleToken.Receiver}>(/public/flowTokenReceiver)
        assert(self.marketReceiver.borrow() != nil, message: "Missing or mis-typed receiver")         

        if !signer.getCapability<&ChainCubeAid.Collection{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(ChainCubeAidCollectionProviderPrivatePath).check() {
            signer.unlink(ChainCubeAidCollectionProviderPrivatePath)
            signer.link<&ChainCubeAid.Collection{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(ChainCubeAidCollectionProviderPrivatePath, target: ChainCubeAid.CollectionStoragePath)
        }

        self.ChainCubeAidProvider = signer.getCapability<&ChainCubeAid.Collection{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(ChainCubeAidCollectionProviderPrivatePath)
        self.ChainCubeAidCollection = signer.borrow<&ChainCubeAid.Collection>(from: ChainCubeAid.CollectionStoragePath)!
        assert(self.ChainCubeAidProvider.borrow() != nil, message: "Missing or mis-typed ChainCubeAid.Collection provider")

        self.storefront = signer.borrow<&NFTStorefrontV2.Storefront>(from: NFTStorefrontV2.StorefrontStoragePath)
            ?? panic("Missing or mis-typed NFTStorefront Storefront")
        
        var storagePath = "ChainCubeAidSet_".concat(ChainCubeAid.clearSpaceLetter(text: metadata["setName"]!))            
        self.minter = signer.borrow<&ChainCubeAid.NFTMinter>(from: StoragePath(identifier: storagePath)!)!
        
        self.mintReceiver = signer.getCapability<&{NonFungibleToken.Receiver}>(ChainCubeAid.CollectionPublicPath)
    }

    execute {           
      
      var count = 0
      var royalties: [MetadataViews.Royalty] = []

      while royaltyBeneficiaries.length > count {
          let beneficiary = royaltyBeneficiaries[count]
          let beneficiaryCapability = getAccount(beneficiary)
          .getCapability<&{FungibleToken.Receiver}>(MetadataViews.getRoyaltyReceiverPublicPath())
          
          if !beneficiaryCapability.check() { panic("Beneficiary capability is not valid!") }

          royalties.append(
              MetadataViews.Royalty(
                  receiver: beneficiaryCapability,
                  cut: cuts[count],
                  description: ""
              )
          )
          count = count + 1
      }

        var totalRoyaltyCut = 0.0

         let packComponents <- self.minter.batchCreateComponents( creator: self.mintReceiver,metadata: metadata, royalties: royalties, quantity: quantity)

         let keys = packComponents.getIDs()
          // Append the cut for the royalty.
        for royalty in royalties {
            self.saleCuts.append(NFTStorefrontV2.SaleCut(receiver: royalty.receiver, amount: royalty.cut * saleItemPrice))
            totalRoyaltyCut = totalRoyaltyCut + royalty.cut * saleItemPrice
        }

        // Append the cut for the seller.
        self.saleCuts.append(NFTStorefrontV2.SaleCut(
            receiver: self.flowReceiver,
            amount: saleItemPrice - totalRoyaltyCut - saleItemPrice * marketPlaceSaleCutPercentage
        ))

        // Append the cut for the marketplace.
        self.saleCuts.append(NFTStorefrontV2.SaleCut(
            receiver: self.marketReceiver,
            amount: saleItemPrice * marketPlaceSaleCutPercentage
        ))

         
         for key in keys {
          let chainCubeToken <- packComponents.withdraw(withdrawID: key)
           self.ChainCubeAidCollection.deposit(token: <-chainCubeToken)
 
        self.storefront.createListing(
            nftProviderCapability: self.ChainCubeAidProvider,
            nftType: Type<@ChainCubeAid.NFT>(),
            nftID: key,
            salePaymentVaultType: Type<@FlowToken.Vault>(),
            saleCuts: self.saleCuts,
            marketplacesCapability: self.marketplacesCapability.length == 0 ? nil : self.marketplacesCapability,
            customID: customID.concat((key).toString()),
            commissionAmount: commissionAmount,
            expiry: expiry
        )

         }   

         destroy packComponents 



        log("Minted an NFT")
    }
}
`

const IS_ACCOUNT_CONFIGURED_SCRIPT = `
    import NonFungibleToken from ${nonFungibleTokenAddress}
    import MetadataViews from ${metadataViewsAddress}
    import NiftoryNonFungibleToken from ${niftoryAddress}
    import NiftoryNFTRegistry from ${niftoryAddress}
    
    import {contractName} from {contractAddress}
    pub fun main(account: Address): Bool {
        let paths = NiftoryNFTRegistry.getCollectionPaths(${registryAddress}, "${clientId}_{contractName}")
        let acct = getAccount(account)
        return acct.getCapability<&{
            NonFungibleToken.Receiver,
            NonFungibleToken.CollectionPublic,
            MetadataViews.ResolverCollection,
            NiftoryNonFungibleToken.CollectionPublic
        }>(paths.public).check()
    }`

const IS_CHAIN_CUBE_ACCOUNT_CONFIGURED_SCRIPT = `
import NonFungibleToken from 0x631e88ae7f1d7c20
import ChainCubeAid from 0x0d5e5c6c8bd04037

// This script returns an array of all the NFT IDs in an account's collection.
pub fun main(address: Address): Bool {
    let account = getAccount(address) 

    let collectionRef = account.getCapability(ChainCubeAid.CollectionPublicPath)!.borrow<&{NonFungibleToken.CollectionPublic}>()
        ?? panic("Could not borrow capability from public collection")
    
    return true
}
`

const CONFIGURE_ACCOUNT_TRANSACTION = `
    import NonFungibleToken from ${nonFungibleTokenAddress}
    import MetadataViews from ${metadataViewsAddress}
    import NiftoryNonFungibleToken from ${niftoryAddress}
    import NiftoryNFTRegistry from ${niftoryAddress}
    import {contractName} from {contractAddress}
    
    transaction {
        prepare(acct: AuthAccount) {
            let paths = NiftoryNFTRegistry.getCollectionPaths(${registryAddress}, "${clientId}_{contractName}")
            
            if acct.borrow<&NonFungibleToken.Collection>(from: paths.storage) == nil {
                let nftManager = NiftoryNFTRegistry.getNFTManagerPublic(${registryAddress}, "${clientId}_{contractName}")
                let collection <- nftManager.getNFTCollectionData().createEmptyCollection()
                acct.save(<-collection, to: paths.storage)
    
                acct.unlink(paths.public)
                acct.link<&{
                    NonFungibleToken.Receiver,
                    NonFungibleToken.CollectionPublic,
                    MetadataViews.ResolverCollection,
                    NiftoryNonFungibleToken.CollectionPublic
                }>(paths.public, target: paths.storage)
    
                acct.unlink(paths.private)
                acct.link<&{
                    NonFungibleToken.Provider,
                    NiftoryNonFungibleToken.CollectionPrivate
                }>(paths.private, target: paths.storage)
            }
        }
    }`

const CUBE_CONFIGURE_ACCOUNT_TRANSACTION = `
import FungibleToken from 0x9a0766d93b6608b7
import NonFungibleToken from 0x631e88ae7f1d7c20
import MetadataViews from 0x631e88ae7f1d7c20
import ChainCubeAid from 0x0d5e5c6c8bd04037
import NFTStorefrontV2 from 0x2d55b98eb200daef

transaction(vaultPath: StoragePath) {

  prepare(acct: AuthAccount) {  
         acct.unlink(ChainCubeAid.CollectionPublicPath)      
         acct.unlink(MetadataViews.getRoyaltyReceiverPublicPath())
    
       if acct.borrow<&ChainCubeAid.Collection>(from: ChainCubeAid.CollectionStoragePath) == nil {
         let collection <- ChainCubeAid.createEmptyCollection()
         acct.save(<-collection, to: ChainCubeAid.CollectionStoragePath)
         acct.link<&ChainCubeAid.Collection{NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, ChainCubeAid.ChainCubeAidCollectionPublic, MetadataViews.ResolverCollection}>(ChainCubeAid.CollectionPublicPath, target: ChainCubeAid.CollectionStoragePath)
       }

      
         
         if acct.borrow<&NFTStorefrontV2.Storefront>(from: NFTStorefrontV2.StorefrontStoragePath) == nil {
             let storefront <- NFTStorefrontV2.createStorefront()
             acct.save(<-storefront, to: NFTStorefrontV2.StorefrontStoragePath)
             acct.link<&NFTStorefrontV2.Storefront{NFTStorefrontV2.StorefrontPublic}>(NFTStorefrontV2.StorefrontPublicPath, target: NFTStorefrontV2.StorefrontStoragePath)
         }     

         acct.link<&ChainCubeAid.Collection{NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, ChainCubeAid.ChainCubeAidCollectionPublic, MetadataViews.ResolverCollection}>(ChainCubeAid.CollectionPublicPath, target: ChainCubeAid.CollectionStoragePath)
       
         let capability = acct.link<&{FungibleToken.Receiver, FungibleToken.Balance}>(
          MetadataViews.getRoyaltyReceiverPublicPath(),
          target: vaultPath
        )!

         if !capability.check() { panic("Beneficiary capability is not valid!") }
  }
 
   execute {
     log("Setup Account")
   }
 }
`;

const CUBE_CREATE_CHARITY_SCRIPT = `
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

`;

const CUBE_GET_COLLECTIONS = ` 
pub fun main(address: Address): [StoragePath] {
    let account = getAuthAccount(address)
    let paths: [StoragePath] = []
    account.forEachStored(fun (path: StoragePath, type: Type): Bool {
        paths.append(path)
        return true
    })
    return paths
  }
`;

const CUBE_DONATE = ` import Charity from 0xc26d1ec60d9fa66b
import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868
transaction (amount: UFix64, creatorAddr : Address, id: UInt64) {
  
  let pubCap: Capability<&Charity.CharityEventCollection{Charity.CharityEventCollectionPublic}>
  let vaultRef: &FungibleToken.Vault

  prepare(acct: AuthAccount) {
    log("start")
    let creatorAcc = getAccount(creatorAddr)
    self.pubCap = creatorAcc.getCapability<&Charity.CharityEventCollection{Charity.CharityEventCollectionPublic}>(Charity.CharityEventCollectionPublicPath)

    self.vaultRef = acct.borrow<&FungibleToken.Vault>(from: /storage/flowTokenVault) ?? panic("Could not borrow reference to the owner's Vault!")
    
  }

  execute{
    log("bef donate")
    self.pubCap.borrow()?.donate(id: id, amount: amount, senderVaultRef: self.vaultRef)
  }
    
}

`;

const CUBE_GET_NFT_ADDRESS_BY_COLLECTION_NAME = `
import NonFungibleToken from 0x631e88ae7f1d7c20
import ChainCubeAid from 0x0d5e5c6c8bd04037

pub fun main(setName:String): &ChainCubeAid.ChainCubeAidSet {

    var set = ChainCubeAid.borrowSet(setName: setName)

    return set
}
`;

const CUBE_GET_LISTING_NFTs_VIEW_SCRIPT = `
import NonFungibleToken from 0x631e88ae7f1d7c20
import MetadataViews from 0x631e88ae7f1d7c20
import ChainCubeAid from 0x0d5e5c6c8bd04037
import NFTStorefrontV2 from 0x2d55b98eb200daef

pub struct ListingItem {
    pub let name: String
    pub let image: String
    pub let description: String
    pub let setName: String

    pub let itemID: UInt64
    pub let resourceID: UInt64
    pub let owner: Address
    pub let price: UFix64

    init(
        setName: String,
        name: String,
        image: String,   
        description: String,
        itemID: UInt64,
        resourceID: UInt64,
        owner: Address,
        price: UFix64
    ) {
        self.setName = setName
        self.name = name
        self.image = image
        self.description = description

        self.itemID = itemID
        self.resourceID = resourceID
        self.owner = owner
        self.price = price
    }
}


pub fun main(address: Address, setName:String): [ListingItem?] {
    let account = getAccount(address)

        let storefrontRef = account
        .getCapability<&NFTStorefrontV2.Storefront{NFTStorefrontV2.StorefrontPublic}>(
            NFTStorefrontV2.StorefrontPublicPath
        )
        .borrow()
        ?? panic("Could not borrow public storefront from address")
    
   let listingResourceIDs = storefrontRef.getListingIDs()

    let saleItems : [ListingItem?]=[]

    for listingResourceID in listingResourceIDs{       

        if let listing = storefrontRef.borrowListing(listingResourceID: listingResourceID) {

            let details = listing.getDetails()

            let itemID = details.nftID
            let itemPrice = details.salePrice

            if let collection = getAccount(address).getCapability<&ChainCubeAid.Collection{NonFungibleToken.CollectionPublic, ChainCubeAid.ChainCubeAidCollectionPublic}>(ChainCubeAid.CollectionPublicPath).borrow() {

                if let item = collection.borrowChainCubeAid(id: itemID) {

                    if let view = item.resolveView(Type<MetadataViews.Display>()) {

                        let display = view as! MetadataViews.Display

                        let owner: Address = item.owner!.address!

                        if(item.metadata["setName"]!="ChainCubeAidSet_".concat(setName)){
                            saleItems.append(ListingItem(
                            setName: item.metadata["setName"]!,
                            name: display.name,
                            image: item.metadata["image"]!,                             
                            description: display.description,                           
                            itemID: itemID,
                            resourceID: listingResourceID,
                            owner: address,
                            price: itemPrice
                        )
                        )
                        }                     
                    }
                }
            }
        }
    } 
    return saleItems
}
`

const CUBE_GET_NFT_VIEW_SCRIPT = `
import NonFungibleToken from 0x631e88ae7f1d7c20
import MetadataViews from 0x631e88ae7f1d7c20
import ChainCubeAid from 0x0d5e5c6c8bd04037

pub struct NFTView {
  pub let id: UInt64
  pub let setID: UInt64
  pub let uuid: UInt64
  pub let name: String
  pub let description: String
  pub let metadata: {String: String}
  pub let thumbnail: String
  pub let royalties: [MetadataViews.Royalty]
  pub let externalURL: String
  pub let collectionPublicPath: PublicPath
  pub let collectionStoragePath: StoragePath
  pub let collectionProviderPath: PrivatePath
  pub let collectionPublic: String
  pub let collectionPublicLinkedType: String
  pub let collectionProviderLinkedType: String
  pub let collectionName: String
  pub let collectionDescription: String
  pub let collectionExternalURL: String
  pub let collectionSquareImage: String
  pub let collectionBannerImage: String
  pub let collectionSocials: {String: String}
  //pub let traits: MetadataViews.Traits

  init(
      id: UInt64,
      setID: UInt64,
      uuid: UInt64,
      name: String,
      description: String,
      metadata: {String: String},
      thumbnail: String,
      royalties: [MetadataViews.Royalty],
      externalURL: String,
      collectionPublicPath: PublicPath,
      collectionStoragePath: StoragePath,
      collectionProviderPath: PrivatePath,
      collectionPublic: String,
      collectionPublicLinkedType: String,
      collectionProviderLinkedType: String,
      collectionName: String,
      collectionDescription: String,
      collectionExternalURL: String,
      collectionSquareImage: String,
      collectionBannerImage: String,
      collectionSocials: {String: String},
      //traits: MetadataViews.Traits
  ) {
      self.id = id
      self.setID = setID
      self.uuid = uuid
      self.name = name
      self.metadata = metadata
      self.description = description
      self.thumbnail = thumbnail
      self.royalties = royalties
      self.externalURL = externalURL
      self.collectionPublicPath = collectionPublicPath
      self.collectionStoragePath = collectionStoragePath
      self.collectionProviderPath = collectionProviderPath
      self.collectionPublic = collectionPublic
      self.collectionPublicLinkedType = collectionPublicLinkedType
      self.collectionProviderLinkedType = collectionProviderLinkedType
      self.collectionName = collectionName
      self.collectionDescription = collectionDescription
      self.collectionExternalURL = collectionExternalURL
      self.collectionSquareImage = collectionSquareImage
      self.collectionBannerImage = collectionBannerImage
      self.collectionSocials = collectionSocials
      //self.traits = traits
  }
}

pub fun main(address: Address, id: UInt64): NFTView {
  let account = getAccount(address)
  var metadata: {String: String} = {}
  var setID:UInt64=0

    if let collection = account.getCapability<&ChainCubeAid.Collection{NonFungibleToken.CollectionPublic, ChainCubeAid.ChainCubeAidCollectionPublic}>(ChainCubeAid.CollectionPublicPath).borrow() {
      
      if let nft = collection.borrowChainCubeAid(id: id) {

        metadata = nft.getMetadata()
        setID = nft.setID
      }
  }

  let collection = account
      .getCapability(ChainCubeAid.CollectionPublicPath)
      .borrow<&{MetadataViews.ResolverCollection}>()
      ?? panic("Could not borrow a reference to the collection")

  let viewResolver = collection.borrowViewResolver(id: id)

  let nftView = MetadataViews.getNFTView(id: id, viewResolver : viewResolver)

  let collectionSocials: {String: String} = {}
  for key in nftView.collectionDisplay!.socials.keys {
      collectionSocials[key] = nftView.collectionDisplay!.socials[key]!.url
  }


  return NFTView(
      id: nftView.id,
      setID: setID,
      uuid: nftView.uuid,
      name: nftView.display!.name,
      description: nftView.display!.description,
      metadata: metadata,
      thumbnail: nftView.display!.thumbnail.uri(),
      royalties: nftView.royalties!.getRoyalties(),
      externalURL: nftView.externalURL!.url,
      collectionPublicPath: nftView.collectionData!.publicPath,
      collectionStoragePath: nftView.collectionData!.storagePath,
      collectionProviderPath: nftView.collectionData!.providerPath,
      collectionPublic: nftView.collectionData!.publicCollection.identifier,
      collectionPublicLinkedType: nftView.collectionData!.publicLinkedType.identifier,
      collectionProviderLinkedType: nftView.collectionData!.providerLinkedType.identifier,
      collectionName: nftView.collectionDisplay!.name,
      collectionDescription: nftView.collectionDisplay!.description,
      collectionExternalURL: nftView.collectionDisplay!.externalURL.url,
      collectionSquareImage: nftView.collectionDisplay!.squareImage.file.uri(),
      collectionBannerImage: nftView.collectionDisplay!.bannerImage.file.uri(),
      collectionSocials: collectionSocials,
      //traits: nftView.traits!,
  )
}
`

const CUBE_PURCHASE_NFT = `
import FungibleToken from 0x9a0766d93b6608b7
import NonFungibleToken from 0x631e88ae7f1d7c20
import MetadataViews from 0x631e88ae7f1d7c20
import FlowToken from 0x7e60df042a9c0868
import ChainCubeAid from 0x0d5e5c6c8bd04037
import NFTStorefrontV2 from 0x2d55b98eb200daef

transaction(listingResourceID: UInt64, storefrontAddress: Address, commissionRecipient: Address?) {
    let paymentVault: @FungibleToken.Vault
    let ChainCubeAidCollection: &ChainCubeAid.Collection{NonFungibleToken.Receiver}
    let storefront: &NFTStorefrontV2.Storefront{NFTStorefrontV2.StorefrontPublic}
    let listing: &NFTStorefrontV2.Listing{NFTStorefrontV2.ListingPublic}
    var commissionRecipientCap: Capability<&{FungibleToken.Receiver}>?

    prepare(acct: AuthAccount) {
        self.commissionRecipientCap = nil
        self.storefront = getAccount(storefrontAddress)
            .getCapability<&NFTStorefrontV2.Storefront{NFTStorefrontV2.StorefrontPublic}>(
                NFTStorefrontV2.StorefrontPublicPath
            )
            .borrow()
            ?? panic("Could not borrow Storefront from provided address")

        self.listing = self.storefront.borrowListing(listingResourceID: listingResourceID)
                    ?? panic("No Offer with that ID in Storefront")
        let price = self.listing.getDetails().salePrice

        let mainFlowVault = acct.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Cannot borrow FlowToken vault from acct storage")
        self.paymentVault <- mainFlowVault.withdraw(amount: price)

        self.ChainCubeAidCollection = acct.borrow<&ChainCubeAid.Collection{NonFungibleToken.Receiver}>(
            from: ChainCubeAid.CollectionStoragePath
        ) ?? panic("Cannot borrow NFT collection receiver from account")

        let commissionAmount = self.listing.getDetails().commissionAmount

        if commissionRecipient != nil && commissionAmount != 0.0 {
            let _commissionRecipientCap = getAccount(commissionRecipient!).getCapability<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
            assert(_commissionRecipientCap.check(), message: "Commission Recipient doesn't have flowtoken receiving capability")
            self.commissionRecipientCap = _commissionRecipientCap
        } else if commissionAmount == 0.0 {
            self.commissionRecipientCap = nil
        } else {
            panic("Commission recipient can not be empty when commission amount is non zero")
        }
    }

    execute {
        let item <- self.listing.purchase(
            payment: <-self.paymentVault,
            commissionRecipient: self.commissionRecipientCap
        )

        self.ChainCubeAidCollection.deposit(token: <-item)
        self.storefront.cleanupPurchasedListings(listingResourceID: listingResourceID)
    }
}
`

const CUBE_GET_NFTs_VIEW_BY_ADDRESS = `
import NonFungibleToken from 0x631e88ae7f1d7c20
import MetadataViews from 0x631e88ae7f1d7c20
import ChainCubeAid from 0x0d5e5c6c8bd04037

pub struct NFTView {
    pub let id: UInt64
    pub let setID: UInt64
    pub let uuid: UInt64
    pub let name: String
    pub let description: String
    pub let metadata: {String: String}
    pub let thumbnail: String
    pub let royalties: [MetadataViews.Royalty]
    pub let externalURL: String
    pub let collectionPublicPath: PublicPath
    pub let collectionStoragePath: StoragePath
    pub let collectionProviderPath: PrivatePath
    pub let collectionPublic: String
    pub let collectionPublicLinkedType: String
    pub let collectionProviderLinkedType: String
    pub let collectionName: String
    pub let collectionDescription: String
    pub let collectionExternalURL: String
    pub let collectionSquareImage: String
    pub let collectionBannerImage: String
    pub let collectionSocials: {String: String}
    //pub let traits: MetadataViews.Traits
  
    init(
        id: UInt64,
        setID: UInt64,
        uuid: UInt64,
        name: String,
        description: String,
        metadata: {String: String},
        thumbnail: String,
        royalties: [MetadataViews.Royalty],
        externalURL: String,
        collectionPublicPath: PublicPath,
        collectionStoragePath: StoragePath,
        collectionProviderPath: PrivatePath,
        collectionPublic: String,
        collectionPublicLinkedType: String,
        collectionProviderLinkedType: String,
        collectionName: String,
        collectionDescription: String,
        collectionExternalURL: String,
        collectionSquareImage: String,
        collectionBannerImage: String,
        collectionSocials: {String: String},
        //traits: MetadataViews.Traits
    ) {
        self.id = id
        self.setID = setID
        self.uuid = uuid
        self.name = name
        self.metadata = metadata
        self.description = description
        self.thumbnail = thumbnail
        self.royalties = royalties
        self.externalURL = externalURL
        self.collectionPublicPath = collectionPublicPath
        self.collectionStoragePath = collectionStoragePath
        self.collectionProviderPath = collectionProviderPath
        self.collectionPublic = collectionPublic
        self.collectionPublicLinkedType = collectionPublicLinkedType
        self.collectionProviderLinkedType = collectionProviderLinkedType
        self.collectionName = collectionName
        self.collectionDescription = collectionDescription
        self.collectionExternalURL = collectionExternalURL
        self.collectionSquareImage = collectionSquareImage
        self.collectionBannerImage = collectionBannerImage
        self.collectionSocials = collectionSocials
        //self.traits = traits
    }
  }
  
  pub fun main(address: Address): [NFTView] {
    let account = getAccount(address)
    var metadata: {String: String} = {}
    var setID:UInt64=0
    var nfts: [NFTView]=[]
  
      let collectionRef = account.getCapability(ChainCubeAid.CollectionPublicPath).borrow<&{NonFungibleToken.CollectionPublic}>()
          ?? panic("Could not borrow capability from public collection")
      
      let ids = collectionRef.getIDs()
  
      for id in ids {
            if let collection = account.getCapability<&ChainCubeAid.Collection{NonFungibleToken.CollectionPublic, ChainCubeAid.ChainCubeAidCollectionPublic}>(ChainCubeAid.CollectionPublicPath).borrow() {
        
        if let nft = collection.borrowChainCubeAid(id: id) {
  
          metadata = nft.getMetadata()
          setID = nft.setID
        }
    }
  
    let collection = account
        .getCapability(ChainCubeAid.CollectionPublicPath)
        .borrow<&{MetadataViews.ResolverCollection}>()
        ?? panic("Could not borrow a reference to the collection")
  
    let viewResolver = collection.borrowViewResolver(id: id)
  
    let nftView = MetadataViews.getNFTView(id: id, viewResolver : viewResolver)
  
    let collectionSocials: {String: String} = {}
    for key in nftView.collectionDisplay!.socials.keys {
        collectionSocials[key] = nftView.collectionDisplay!.socials[key]!.url
    }
  
  
    nfts.append(NFTView(
        id: nftView.id,
        setID: setID,
        uuid: nftView.uuid,
        name: nftView.display!.name,
        description: nftView.display!.description,
        metadata: metadata,
        thumbnail: nftView.display!.thumbnail.uri(),
        royalties: nftView.royalties!.getRoyalties(),
        externalURL: nftView.externalURL!.url,
        collectionPublicPath: nftView.collectionData!.publicPath,
        collectionStoragePath: nftView.collectionData!.storagePath,
        collectionProviderPath: nftView.collectionData!.providerPath,
        collectionPublic: nftView.collectionData!.publicCollection.identifier,
        collectionPublicLinkedType: nftView.collectionData!.publicLinkedType.identifier,
        collectionProviderLinkedType: nftView.collectionData!.providerLinkedType.identifier,
        collectionName: nftView.collectionDisplay!.name,
        collectionDescription: nftView.collectionDisplay!.description,
        collectionExternalURL: nftView.collectionDisplay!.externalURL.url,
        collectionSquareImage: nftView.collectionDisplay!.squareImage.file.uri(),
        collectionBannerImage: nftView.collectionDisplay!.bannerImage.file.uri(),
        collectionSocials: collectionSocials,
        //traits: nftView.traits!,
    )
    )
      }
  
  
  return  nfts
  }
`

const CUBE_GET_ALL_CHARITY = `
import Charity from 0xc26d1ec60d9fa66b 

pub fun main(): [Charity.CharityDetails]  {
  let allEvents: [Charity.CharityDetails] = []
  for addr in Charity.creators {
    let cap = getAccount(addr).getCapability<&Charity.CharityEventCollection{Charity.CharityEventCollectionPublic}>(Charity.CharityEventCollectionPublicPath).borrow()!
    allEvents.appendAll(cap.getCharityEventsDetails().values)
  }

  return allEvents
}

`


const CUBE_GET_DONATERS = `
import Charity from 0xc26d1ec60d9fa66b

pub fun main(creatorAddr: Address, id: UInt64): {Address:UFix64}  {
    let cap = getAccount(creatorAddr).getCapability<&Charity.CharityEventCollection{Charity.CharityEventCollectionPublic}>
            (Charity.CharityEventCollectionPublicPath).borrow()!

    return cap.getDonators(id: id)
}

`

function prepareCadence(script: string, contractName: string, address: string) {
    return script.replaceAll("{contractName}", contractName).replaceAll("{contractAddress}", address)
}

export function useContractCadence() {
    const {contract, fetching} = useGraphQLQuery<ContractQuery, ContractQueryVariables>({
        query: ContractDocument,
    })

    let isAccountConfigured_script: string
    let isChainCubeAccountConfigured_script: string
    let transferToken_script: string
    let craete_set_script: string
    let craete_batch_and_sell_script: string
    let configureAccount_transaction: string
    let cube_configureAccount_transaction: string
    let cube_create_charity_script: string
    let cube_get_collections_script: string
    let cube_get_nft_address_by_collection_name_script: string
    let cube_get_nft_listing_nfts_view_script: string
    let cube_get_nft_view_script: string
    let cube_purchase_nft_script: string
    let cube_get_nfts_view_by_address_script: string
    let cube_get_all_charity_script: string
    let cube_get_donaters: string
    let donate_script: string
    if (contract && !fetching) {
        const {name, address} = contract

        transferToken_script = prepareCadence(TRANSFER_TOKEN, name, address)

        cube_get_donaters = prepareCadence(CUBE_GET_DONATERS, name, address)
        donate_script = prepareCadence(CUBE_DONATE, name, address)
        craete_set_script = prepareCadence(CREATE_SET_SCRIPT, name, address)
        craete_batch_and_sell_script = prepareCadence(CREATE_BATCH_AND_SELL_SCRIPT, name, address)
        cube_create_charity_script = prepareCadence(CUBE_CREATE_CHARITY_SCRIPT, name, address)
        cube_get_collections_script = prepareCadence(CUBE_GET_COLLECTIONS, name, address)
        cube_get_nft_address_by_collection_name_script = prepareCadence(CUBE_GET_NFT_ADDRESS_BY_COLLECTION_NAME, name, address)
        cube_get_nft_listing_nfts_view_script = prepareCadence(CUBE_GET_LISTING_NFTs_VIEW_SCRIPT, name, address)
        cube_get_nft_view_script = prepareCadence(CUBE_GET_NFT_VIEW_SCRIPT, name, address)
        cube_purchase_nft_script = prepareCadence(CUBE_PURCHASE_NFT, name, address)
        cube_get_nfts_view_by_address_script = prepareCadence(CUBE_GET_NFTs_VIEW_BY_ADDRESS, name, address)
        cube_get_all_charity_script = prepareCadence(CUBE_GET_ALL_CHARITY, name, address)

        isAccountConfigured_script = prepareCadence(IS_ACCOUNT_CONFIGURED_SCRIPT, name, address)

        isChainCubeAccountConfigured_script = prepareCadence(IS_CHAIN_CUBE_ACCOUNT_CONFIGURED_SCRIPT, name, address)

        configureAccount_transaction = prepareCadence(CONFIGURE_ACCOUNT_TRANSACTION, name, address)

        cube_configureAccount_transaction = prepareCadence(CUBE_CONFIGURE_ACCOUNT_TRANSACTION, name, address)
    }

    return {
        cube_get_donaters,
        donate_script,
        cube_get_all_charity_script,
        cube_get_nfts_view_by_address_script,
        cube_purchase_nft_script,
        cube_get_nft_view_script,
        cube_get_nft_listing_nfts_view_script,
        cube_get_nft_address_by_collection_name_script,
        cube_create_charity_script,
        cube_get_collections_script,
        craete_set_script,
        craete_batch_and_sell_script,
        cube_configureAccount_transaction,
        isChainCubeAccountConfigured_script,
        transferToken_script,
        isAccountConfigured_script,
        configureAccount_transaction,
        isLoading: fetching,
    }
}
