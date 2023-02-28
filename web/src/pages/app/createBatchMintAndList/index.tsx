import AppLayout from "../../../components/AppLayout"
import Breadcrumb from "@components/breadcrumb/Breadcrumb";
import {Heading, Select, useBreakpointValue} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import {useContractCadence} from "../../../hooks/useContractCadence";
import * as fcl from "@onflow/fcl"
import toast from "react-hot-toast"
import {useFlowUser} from "../../../hooks/userFlowUser";
import {useRouter} from "next/router";


const initData = {
    btn: "Create NFTs",
    notice: "We will create bulk NFTs for aid"
}

const CreateBatchMintAndListPage = () => {
    const flowUser = useFlowUser()
    const router = useRouter()
    const isMobile = useBreakpointValue({base: true, md: false})

    const [ipfsUrl, setIpfsUrl] = useState("ipfs/Qmd1PxWiv9Rwz2TpXhvUM4YmSQ2Xx9KMob6B5yhPTHTXLU");
    const [name, setName] = useState(null);
    const [quantity, setQuantity] = useState(null);
    const [price, setPrice] = useState(null);
    const [desc, setDesc] = useState(null);
    const [collections, setCollections] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState(null);

    const {
        craete_batch_and_sell_script, cube_get_collections_script
    } = useContractCadence()


    useEffect(() => {
        (async function () {
            if (flowUser === undefined || !flowUser?.addr) {
                return
            }
            const collections = await getCollections();
        })()
    }, [flowUser?.addr, cube_get_collections_script])

    const getCollections = async () => {
        try {
            const collections = await fcl.query({
                cadence: cube_get_collections_script,
                args: (arg, t) => [
                    arg(flowUser?.addr, t.Address)
                ],
                limit: 9999,
            })

            const options = []
            collections.forEach(element => {
                if (element.identifier.indexOf("ChainCubeAidSet_") >= 0) {
                    options.push({
                        label: element.identifier.replace("ChainCubeAidSet_", "").replaceAll("_", " "),
                        value: element.identifier.replace("ChainCubeAidSet_", "")
                    })
                }
            });
            setCollections(options)

            return collections;
        } catch (error) {
            toast.error("Error "+error)
        }
    }

    const createBatchNfts = async () => {
        let toastId;
        try {

            toastId = toast.loading("Creating NFTs...", {id: toastId})
            if (name == "" || name === null) {
                toast.error("Invalid name!", {id: toastId})
                return;
            }

            if (desc == "" || desc === null) {
                toast.error("Invalid description!", {id: toastId})
                return;
            }

            if (selectedCollection == "" || selectedCollection === null || selectedCollection === "Select Collection") {
                toast.error("Invalid collection name!", {id: toastId})
                return;
            }

            if (quantity > 25 || quantity < 4) {
                toast.error("Invalid quantity! Quantity must be higher than 4 and less than 25!", {id: toastId})
                return;
            }

            if (ipfsUrl == "" || ipfsUrl === null) {
                toast.error("Invalid ipfs url!", {id: toastId})
                return;
            }

            if (price <= 0) {
                toast.error("Price must be higher than 0 !", {id: toastId})
                return;
            }


            var metadata = [
                {key: "setName", value: selectedCollection},
                {key: "nftType", value: "SOCIALAID"},
                {key: "name", value: name},
                {key: "description", value: desc},
                {key: "thumbnail", value: "https://limitlesscube.infura-ipfs.io/" + ipfsUrl},
                {key: "magnitude", value: "7.8"}, //  place coordinates
                {key: "longitude", value: "25"},//  place coordinates
                {key: "latitude", value: "45"},//  place coordinates
                {key: "image", value: "https://limitlesscube.infura-ipfs.io/" + ipfsUrl}//  original nft Image
            ];

            const cuts = ["0.0"];
            const royalties = [flowUser?.addr];

            const marketFeeAccount = flowUser?.addr;
            const recipient = flowUser?.addr;
            const marketFeePercentage = "0.0";
            const customID = "";
            const commissionAmount = "0.0";
            const expiry = parseInt("1965671084");
            const prices = parseFloat(price).toFixed(3);

            const txId = await fcl.mutate({
                cadence: craete_batch_and_sell_script,
                args: (arg, t) => [
                    arg(marketFeeAccount, t.Address),
                    arg(marketFeePercentage, t.UFix64),
                    arg(recipient, t.Address),
                    arg(metadata, t.Dictionary({key: t.String, value: t.String})),
                    arg(royalties, t.Array(t.Address)),
                    arg(cuts, t.Array(t.UFix64)),
                    arg(prices, t.UFix64),
                    arg(customID, t.String),
                    arg(commissionAmount, t.UFix64),
                    arg(expiry, t.UInt64),
                    arg(quantity, t.UInt8),
                ],
                limit: 9999,
            })


            await fcl.tx(txId).onceSealed().then(r => {
                toast.success("Successfully Create NFTs", {id: toastId})
            })

        } catch (err) {
            toast.error("Cannot create NFTs" + err, {id: toastId})
        }
    }

    return (
        <>
            <AppLayout title="Create Batch NFTs | Crypto Moneybox">
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
                                Create Aid NFTs
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
                                            <Select
                                                width="100%"
                                                size="xl"
                                                style={{padding: "15px"}}
                                                placeholder="Select Collection"
                                                onChange={(e) => setSelectedCollection(e.target.value)}
                                            >
                                                {collections!.map((a) => (
                                                    <option
                                                        key={a.value}
                                                        value={a.value}>
                                                        {a.label}
                                                    </option>
                                                ))}
                                            </Select>
                                            <small className="form-text mt-2">Enter the name of
                                                your <strong>CREATED</strong> collection
                                                name</small>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="name">Name</label>
                                            <input type="text" id="name" style={{padding: "7px"}}
                                                   onChange={(e) => setName(e.target.value)}
                                                   placeholder="NFT Name"/>
                                            <small className="form-text mt-2">Enter the name of your nft</small>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="name">Description</label>
                                            <textarea id="name" style={{padding: "7px"}}
                                                   onChange={(e) => setDesc(e.target.value)}
                                                   placeholder="Description"/>
                                            <small className="form-text mt-2">Enter the description of your nft</small>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="short-description">IPFS Image Url</label>
                                            <input type="text" id="short-description"
                                                   defaultValue="ipfs/Qmd1PxWiv9Rwz2TpXhvUM4YmSQ2Xx9KMob6B5yhPTHTXLU"
                                                   onChange={(e) => setIpfsUrl(e.target.value)} style={{padding: "7px"}}
                                                   placeholder="IPFS Url"/>
                                            <small className="form-text mt-2">Enter the ipfs image
                                                url of your nft </small>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="short-description">Quantity</label>
                                            <input type="number" id="short-description"
                                                   onChange={(e) => setQuantity(parseInt(e.target.value))}
                                                   style={{padding: "7px"}}
                                                   placeholder="Quantity"/>
                                            <small className="form-text mt-2">Enter the nft quantity</small>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="short-description">Price</label>
                                            <input type="number" id="short-description"
                                                   onChange={(e) => setPrice(e.target.value)}
                                                   style={{padding: "7px"}}
                                                   placeholder="Price"/>
                                            <small className="form-text mt-2">Enter the price</small>
                                        </div>
                                        <span className="d-inline-block">{initData.notice}</span> <br/>
                                        <button type="button" className="btn btn-bordered active mt-4"
                                                onClick={() => createBatchNfts()}>{initData.btn} <i
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

CreateBatchMintAndListPage.requireAuth = true
export default CreateBatchMintAndListPage
