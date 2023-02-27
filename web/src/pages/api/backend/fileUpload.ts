import { NextApiHandler } from "next"
import { getClientForServer } from "../../../graphql/getClientForServer"
import { UploadNftContentDocument } from "../../../../generated/graphql"

const handler: NextApiHandler = async (req, res) => {
  try {
    const requestMethod = req.method
    const variables = req.body

    const serverSideBackendClient = await getClientForServer()

    if (requestMethod === "POST") {
      const postData = await serverSideBackendClient.request(UploadNftContentDocument, variables)
      res.status(200).json(postData)
    } else {
      res.status(405).end("Method not allowed, this endpoint only supports POST")
    }
  } catch (e) {
    res.status(500).json(e)
  }
}

export default handler
