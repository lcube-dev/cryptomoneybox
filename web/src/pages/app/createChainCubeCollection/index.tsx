import AppLayout from "../../../components/AppLayout"
import Breadcrumb from "@components/breadcrumb/Breadcrumb";
import {Heading, useBreakpointValue} from "@chakra-ui/react";
import React, {useState} from "react";
import {useContractCadence} from "../../../hooks/useContractCadence";
import * as fcl from "@onflow/fcl"
import toast from "react-hot-toast"
import {useFlowUser} from "../../../hooks/userFlowUser";


const initData = {
    btn: "Create Collection",
    notice: "We will create collection in the Flow Blockchain"
}

const CreateChainCubeCollectionPage = () => {
    const flowUser = useFlowUser()
    const isMobile = useBreakpointValue({base: true, md: false})

    const [ipfsUrl, setIpfsUrl] = useState(null);
    const [collectionName, setCollectionName] = useState(null);

    const {
        craete_set_script
    } = useContractCadence()


    const createCollection = async () => {
        let toastId;
        try {
            toastId = toast.loading("Creating Collection...")
            if (collectionName == "" || collectionName === null) {
                toast.error("Invalid collection name!", {id: toastId})
                return;
            }

            if (ipfsUrl == "" || ipfsUrl === null) {
                toast.error("Invalid ipfs url!", {id: toastId})
                return;
            }

            var metadata = [
                {key: "setName", value: collectionName},
                {key: "thumbnail", value: ipfsUrl},
            ];

            const txId = await fcl.mutate({
                cadence: craete_set_script,
                args: (arg, t) => [
                    arg(metadata, t.Dictionary({key: t.String, value: t.String})),
                ],
                limit: 9999,
            })

            console.log("txId " + txId)

            await fcl.tx(txId).onceSealed().then(r => toast.success("Successfully Create Collection", {id: toastId}))

        } catch (err) {
            toast.error("cannot create collection" + err, {id: toastId})
        }
    }


    return (
        <>
            <AppLayout title="Craete Collection | Crypto Moneybox">
                <section className="apply-area" style={{color: "white"}}>
                    <div className="container">
                        <div className="row justify-content-center">
                            <Heading
                                as="h1"
                                fontWeight="900"
                                textAlign="center"
                                color="white"
                                fontFamily="Poppins"
                                lineHeight="1.2"
                                fontSize={!isMobile ? "4.5rem" : "2rem"}
                            >
                                Create Collection
                            </Heading>
                        </div>
                    </div>

                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-12 col-md-8">
                                <div className="apply-form card no-hover">

                                    <form action="#">
                                        <div className="form-group">
                                            <label htmlFor="name">Collection Name</label>
                                            <input type="text" id="name" style={{padding: "7px"}}
                                                   onChange={(e) => setCollectionName(e.target.value)}
                                                   placeholder="Collection Name"/>
                                            <small className="form-text mt-2">Enter the name of your collection name</small>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="short-description">IPFS Image Url</label>
                                            <input type="text" id="short-description"
                                                   onChange={(e) => setIpfsUrl(e.target.value)} style={{padding: "7px"}}
                                                   placeholder="IPFS Url"/>
                                            <small className="form-text mt-2">Enter the name of your ipfs image
                                                url</small>
                                        </div>
                                        <span className="d-inline-block">{initData.notice}</span> <br/>
                                        <button type="button" className="btn btn-bordered active mt-4"
                                                onClick={() => createCollection()}>{initData.btn} <i
                                            className="icon-login ml-2"/></button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </AppLayout>
        </>
    )
}

CreateChainCubeCollectionPage.requireAuth = true
export default CreateChainCubeCollectionPage
