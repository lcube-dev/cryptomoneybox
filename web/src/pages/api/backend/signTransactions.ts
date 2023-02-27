import {NextApiHandler} from "next"
import {gql} from "graphql-request"
import {getClientForServer} from "../../../graphql/getClientForServer"
import {unstable_getServerSession} from "next-auth";
import {AUTH_OPTIONS} from "../auth/[...nextauth]";
import {
    RegisterWalletDocument,
    RegisterWalletMutation,
    RegisterWalletMutationVariables, SignTransactionForDapperWalletDocument,
    SignTransactionForDapperWalletMutation,
    SignTransactionForDapperWalletMutationVariables
} from "../../../../generated/graphql";

const SignTransactionForDapperWallet = gql`
  mutation SignTransactionForDapperWallet($transaction: String) {
    signTransactionForDapperWallet(transaction: $transaction)
  }
`

const handler: NextApiHandler = async (req, res) => {
    try {

        const input = req.body

        console.log("variables " + input)
        console.log("req.method " + req.method)

        const session = await unstable_getServerSession(req, res, AUTH_OPTIONS)
        console.log("session " + session)
        if (!session.authToken || !session.userId) {
            res.status(401).send("There must be a user signed in to use this API route")
            return
        }

        if (req.method !== "POST") {
            res.status(405).send("Method not allowed, this endpoint only supports POST")
            return
        }

        if (input?.transaction == null) {
            res.status(400).send("'transaction' isn't specified in the request body")
            return
        }

        const backendGQLClient = await getClientForServer()

        const checkoutResponse = await backendGQLClient.request<
            SignTransactionForDapperWalletMutation,
            SignTransactionForDapperWalletMutationVariables
            >(SignTransactionForDapperWalletDocument, {
            transaction: input.transaction,
        })

        res.status(200).json(checkoutResponse)
    } catch (e) {
        res.status(500).json(e)

    }
}

export default handler
