declare module "@onflow" {}

// Add type definitions from https://docs.onflow.org/fcl/reference/api/ on a use-by-use basis
declare module "@onflow/fcl" {
  type ConfigInstance = {
    put: (key: string, value: any) => ConfigInstance
    get: (key: string, fallback: string) => any
  }

  /** https://docs.onflow.org/fcl/reference/api/#Address */
  type Address = string

  /** https://docs.onflow.org/fcl/reference/api/#Contract */
  type Contract = string

  /** https://docs.onflow.org/fcl/reference/api/#ArgumentObject */
  type ArgumentObject = {
    value: any
    xform: FType
  }

  /** https://docs.onflow.org/fcl/reference/api/#FType */
  type FType = {
    UInt
    UInt8
    UInt16
    UInt32
    UInt64
    UInt128
    UInt256
    Int
    Int8
    Int16
    Int32
    Int64
    Int128
    Int256
    Word8
    Word16
    Word32
    Word64
    UFix64
    Fix64
    String
    Character
    Bool
    Address
    Optional
    Array
    Dictionary
    Path
  }

  /** https://docs.onflow.org/fcl/reference/api/#ResponseObject */
  type ResponseObject = {
    tag: number
    transaction?: unknown
    transactionStatus?: unknown
    transactionId?: unknown
    encodedData?: unknown
    events?: unknown
    account?: AccountObject
    block?: unknown
    blockHeader?: unknown
    collection?: unknown
  }

  type SignableObject = {
    addr: Address
    keyId: number
    signature: string
  }

  type SigningFunctionPayload = {
    message: string
    addr: string
    keyId: string
    roles: string
    voucher: unknown
  }

  /** https://developers.flow.com/tools/fcl-js/reference/api#signing-function */
  type SigningFunction = (payload: SigningFunctionPayload) => Promise<SignableObject>


  /** https://docs.onflow.org/fcl/reference/api/#authorizationobject */
  type AuthorizationObject = {
    addr: Address
    signingFunction: SigningFunction
    tempId: string
    keyId: number
    sequenceNum?: number
  }



  /** https://developers.flow.com/tools/fcl-js/reference/api#keyobject */
  type KeyObject = {
    index: number
    publicKey: string
    signAlgo: number
    hashAlgo: number
    weight: number
    sequenceNumber: number
    revoked: boolean
  }

  /** https://developers.flow.com/tools/fcl-js/reference/api#accountobject */
  type AccountObject = {
    address: Address
    balance: number
    code: unknown
    contracts: Record<string, string>
    keys: KeyObject[]
  }

  /** https://docs.onflow.org/fcl/reference/api/#authorization-function */
  type AuthorizationFunction = (account: AccountObject) => Promise<AuthorizationObject>

  /** https://docs.onflow.org/fcl/reference/api/#Interaction */
  type Interaction = Builder
  type PartialInteraction = Interaction

  type ServiceObject = unknown

  /** https://docs.onflow.org/fcl/reference/api/#currentuserobject */
  type CurrentUserObject = {
    addr?: Address
    cid?: string
    expiresAt?: number
    f_type: string
    f_vsn: string
    loggedIn?: boolean
    services: [ServiceObject]
    subscribe: (callback: (obj: CurrentUserObject, ...args: unknown[]) => void) => void
    authorization: AuthorizationFunction
    signUserMessage: (message: string) => Promise<CompositeSignature[]>
  }

  /** https://developers.flow.com/tools/fcl-js/reference/api#authz */
  export const authz: AuthorizationObject


  /** https://docs.onflow.org/fcl/reference/api/#mutate */
  type MutateParams = {
    cadence: string
    args?: ArgumentFunction
    limit?: number
    proposer?: AuthorizationFunction | AuthorizationObject
    payer?: AuthorizationFunction | AuthorizationObject
    authorizations?: (AuthorizationFunction | AuthorizationObject)[]
  }

  /** https://docs.onflow.org/fcl/reference/api/#mutate */
  type QueryParams = {
    cadence: string
    args?: ArgumentFunction
    limit?: number
  }

  type Arg = unknown

  /** https://docs.onflow.org/fcl/reference/api/#argumentfunction */
  type ArgumentFunction = (arg: function, t: FType) => Array<Arg>

  /** https://github.com/onflow/fcl-js/blob/master/packages/fcl/src/wallet-provider-spec/draft-v2.md#compositesignature */
  type CompositeSignature = {
    addr: string
    keyId: number
    signature: string
  }

  /** https://docs.onflow.org/fcl/reference/api/#config */
  export function config(): ConfigInstance

  /**
   * https://docs.onflow.org/fcl/reference/api/#tx
   * @description Implementation here: https://github.com/onflow/fcl-js/blob/master/packages/fcl/src/transaction/index.js#L94*/
  export function tx(transactionId: string | ResponseObject): {
    snapshot: () => Promise<unknown>

    // Returns an unsubscribe function
    subscribe: (callback: unknown) => () => void

    onceFinalized: () => Promise<unknown>
    onceExecuted: () => Promise<unknown>
    onceSealed: () => Promise<unknown>
  }

  /** https://docs.onflow.org/fcl/reference/api/#currentusersubscribe */
  export const currentUser: CurrentUserObject

  /** https://docs.onflow.org/fcl/reference/api/#login */
  export function logIn(): void

  /** https://docs.onflow.org/fcl/reference/api/#unauthenticate */
  export function unauthenticate(): void

  /** https://docs.onflow.org/fcl/reference/api/#mutate */
  export function mutate(params: MutateParams): Promise<string>

  /** https://docs.onflow.org/fcl/reference/api/#query */
  export function query(params: QueryParams): Promise<any>

  export const AppUtils: {
    /** https://docs.onflow.org/fcl/reference/api/#apputilsverifyusersignatures */
    verifyUserSignatures: (
      message: string,
      compositeSignatures: CompositeSignature[],
      opts?: { fclCryptoContract?: string }
    ) => boolean
  }
}

declare module "@onflow/transport-grpc" {
  export function send(): void
}
