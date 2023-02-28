import AppLayout from "../../../components/AppLayout"
import {Heading, Link, Select, Spinner, useBreakpointValue} from "@chakra-ui/react";
import React, {useEffect, useMemo, useState} from "react";
import * as fcl from "@onflow/fcl";
import {useContractCadence} from "../../../hooks/useContractCadence";
import {useFlowUser} from "../../../hooks/userFlowUser";
import toast from "react-hot-toast";
import {useRouter} from "next/router";

const initData = {
    sub_heading: "Exclusive",
    heading: "Ongoing IGOs",
    btn: "View Leaderboard",
}

const NFTDetailsPage = () => {
    const flowUser = useFlowUser()
    const router = useRouter()
    const {pathname, query} = useRouter();
    const isMobile = useBreakpointValue({base: true, md: false})

    const [nftDetails, setNftDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const {cube_get_nft_view_script, cube_purchase_nft_script} = useContractCadence()

    useEffect(() => {
        (async function () {
            setIsLoading(true)
            if (cube_get_nft_view_script === undefined) {
                setIsLoading(false)
                return
            }
            await getNFT();
        })()
    }, [query, cube_get_nft_view_script])


    const getNFT = async () => {
        try {
            const itemId = query.itemID;
            const nftDetail = await fcl.query({
                cadence: cube_get_nft_view_script,
                args: (arg, t) => [
                    arg(query.ownerAddr, t.Address),
                    arg(parseInt(itemId.toString()), t.UInt64)
                ],
                limit: 9999,
            })
            setNftDetails(nftDetail)
            setIsLoading(false)
            return nftDetails;
        } catch (error) {
            toast.error("An unexpected error was encountered. Try again!")
            setIsLoading(false)
        }
    }

    const buyNFT = async () => {
        let toastId;
        toastId = toast.loading("Buying NFTs...")
        try {
            const address = query.ownerAddr;
            const resourceId = query.resourceID;
            const marketFeeAccount = "0x0d5e5c6c8bd04037";

            const txId = await fcl.mutate({
                cadence: cube_purchase_nft_script,
                args: (arg, t) => [
                    arg(parseInt(resourceId.toString()), t.UInt64),
                    arg(address, t.Address),
                    arg(marketFeeAccount, t.Address)
                ],
                limit: 9999,
            })


            await fcl.tx(txId).onceSealed().then(r => {
                toast.success("Successfully ! ", {id: toastId})
                router.push("/app/aid-organizations")
            })

        } catch (err) {
            toast.error("Cannot buy NFTs" + err, {id: toastId})
        }
    }

    return (
        <>
            <AppLayout title="NFT Detail | Crypto Moneybox">
                <section className="single featured post-details">
                    <div className="container">
                        <div className="row">
                            {/* Main */}
                            <div className="col-12 col-lg-8 p-0">
                                <div className="row">
                                    <div className="col-12 align-self-center">
                                        {/* Image */}
                                        <div className="blog-thumb">
                                            <img className="w-100" src={nftDetails?.metadata.image} alt=""/>
                                        </div>
                                        <h2 className="featured ml-0" style={{
                                            fontSize: "35px",
                                            fontWeight: 600,
                                            margin: "10px"
                                        }}>{nftDetails?.name}</h2>
                                        <p style={{
                                            fontSize: "20px",
                                            margin: "10px",
                                            color: "white"
                                        }}>{nftDetails?.description}</p>
                                    </div>
                                </div>
                            </div>

                            <aside className="col-12 col-lg-4 pl-lg-5 p-0 float-right sidebar">
                                <div className="row">
                                    <div className="col-12 align-self-center text-left">
                                        <div className="item widget-categories">
                                            <h4 className="title">Collection</h4>
                                            <ul className="list-group list-group-flush mt-2">
                                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                                    <div style={{color:"white"}} >{nftDetails?.metadata.setName}</div>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="item widget-share-this">
                                            <h4 className="title">Share</h4>
                                            <ul className="navbar-nav social share-list mt-2">
                                                <li className="nav-item">
                                                    <Link href="#" className="nav-link"><i
                                                        className="icon-social-instagram ml-0"/></Link>
                                                </li>
                                                <li className="nav-item">
                                                    <Link href="#" className="nav-link"><i
                                                        className="icon-social-facebook"/></Link>
                                                </li>
                                                <li className="nav-item">
                                                    <Link href="#" className="nav-link"><i
                                                        className="icon-social-twitter"/></Link>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="item widget-share-this">
                                            <h4 className="title">Owner</h4>
                                            <div style={{color:"white", marginTop:"15px"}} >  {query.ownerAddr} </div>
                                        </div>
                                        <div className="item widget-share-this">
                                            <button className="btn btn-bordered-white text-white justify-content-end mt-5" onClick={buyNFT}>
                                                Buy
                                                <i className="icon-login ml-2"/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </aside>


                        </div>
                    </div>
                </section>
            </AppLayout>
        </>
    )
}

NFTDetailsPage.requireAuth = true
export default NFTDetailsPage
