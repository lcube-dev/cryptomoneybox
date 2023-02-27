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

const CharityDetailsPage = () => {
    const flowUser = useFlowUser()
    const router = useRouter()
    const {query} = useRouter();
    const isMobile = useBreakpointValue({base: true, md: false})

    const [txs, setTxs] = useState([]);
    const [nftDetails, setNftDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [donate, setDonate] = useState(null);
    const [isLoadingDonate, setIsLoadingDonate] = useState(false);
    const {donate_script} = useContractCadence()

    useEffect(() => {
        (async function () {
            setIsLoading(true)
            if (flowUser === undefined || !flowUser?.addr || query?.item === "") {
                return
            }
            if (query?.item === "") {
                await router.push("/app/charities")
            }
            const data = query?.item
            if (typeof data === "string") {
                setNftDetails(JSON.parse(data).data)
            }
            setIsLoading(false)
        })()
    }, [query, flowUser?.addr])


    const donateFunc = async (id, addr) => {
        let toastId;
        try {
            setIsLoadingDonate(true)
            const donateTx = await fcl.mutate({
                cadence: donate_script,
                args: (arg, t) => [
                    arg(parseFloat(donate).toFixed(5), t.UFix64),
                    arg(addr, t.Address),
                    arg(parseInt(id.toString()), t.UInt64)
                ],
                limit: 9999,
            })
            await fcl.tx(donateTx).onceSealed()
            toast.success("Successfully Donate! Thank you", {id: toastId})
            const txsData = []
            txsData.push(donateTx)
            setTxs([...txs, txsData])
            setIsLoadingDonate(false)
        } catch (error) {
            toast.error("An unexpected error was encountered. Try again!", {id: toastId})
            console.log(error);
            setIsLoadingDonate(false)
        }
    }
    return (
        <>
            <AppLayout title="Charity Detail | Crypto Moneybox">
                <section className="single featured post-details">
                    <div className="container">
                        <div className="row justify-content-center">
                            <Heading
                                as="h1"
                                fontWeight="900"
                                textAlign="center"
                                color="white"
                                fontFamily="Poppins"
                                lineHeight="1.2"
                                marginBottom="10px"
                                fontSize={!isMobile ? "4.5rem" : "2rem"}
                            >
                                Charity Details
                            </Heading>
                        </div>
                    </div>
                    <div className="container">
                        {
                            isLoading ?
                                <section className="blog-area">
                                    <div className="container">
                                        <div className="row items justify-content-center align-content-center">
                                            <Spinner size="xl"/>
                                        </div>
                                    </div>
                                </section>
                                :
                                <div className="row">
                                    {/* Main */}
                                    <div className="col-12 col-lg-8 p-0">
                                        <div className="row">
                                            <div className="col-12 align-self-center">
                                                {/* Image */}
                                                <div className="blog-thumb">
                                                    <img className="w-100" src={nftDetails?.nftMetadata.image} alt=""/>
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
                                                }}>{nftDetails?.desc}</p>
                                                <div className="item widget-share-this mt-lg-5">
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <input type="number"
                                                                   id="short-description"
                                                                   onChange={(e) => setDonate(e.target.value)}
                                                                   style={{
                                                                       padding: "7px",
                                                                       color: "white",
                                                                       borderRadius: "15px",
                                                                       marginBottom: isMobile ? "10px" : "0"
                                                                   }}
                                                                   placeholder="Donate"/>
                                                        </div>
                                                        <div className="col-md-6 pl-0">
                                                            {
                                                                isLoadingDonate ?
                                                                    <Spinner size="lg" color="white"/>
                                                                    :
                                                                    <Link
                                                                        className="btn btn-bordered active smooth-anchor center "
                                                                        css={{
                                                                            width: isMobile ? "100%" : "200px",
                                                                            marginLeft: isMobile ? "15px" : "0"
                                                                        }}
                                                                        onClick={() => donateFunc(nftDetails?.id, nftDetails?.creatorAddr)}> Donate</Link>
                                                            }

                                                        </div>
                                                    </div>
                                                    {
                                                        txs.length > 0 && txs.map((a, i) =>
                                                            <div className="row">
                                                                <div className="col-md-6 pl-0">
                                                                    <a
                                                                        className="btn btn-bordered active smooth-anchor center "
                                                                        style={{
                                                                            width: isMobile ? "100%" : "200px",
                                                                            margin: isMobile ? "15px" : "15px"
                                                                        }}
                                                                        onClick={() => {
                                                                                const url = "https://testnet.flowscan.org/transaction/" + a
                                                                                window.open(url)
                                                                            }
                                                                        }>
                                                                        Show Donate Transaction {i + 1}
                                                                    </a>

                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <aside className="col-12 col-lg-4 pl-lg-5 p-0 float-right sidebar"
                                           style={{justifyContent: isMobile ? "center" : "left", display: "grid"}}>
                                        <div className="row">
                                            <div className="col-12 align-self-center text-left">
                                                <div className="item widget-categories ">
                                                    <h4 className="title">Donated Address</h4>
                                                    <ul className="list-group list-group-flush mt-2">
                                                        <li className="list-group-item d-flex justify-content-between align-items-center  text-center">
                                                            <div className=" text-center"
                                                                 style={{color: "white"}}>{nftDetails?.donatedAddr}</div>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div className="item widget-categories">
                                                    <h4 className="title">Target Amount</h4>
                                                    <ul className="list-group list-group-flush mt-2">
                                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                                            <div
                                                                style={{color: "white"}}>{parseFloat(nftDetails?.targetAmount).toFixed(1)} FLOW</div>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div className="item widget-categories">
                                                    <h4 className="title">End Date</h4>
                                                    <ul className="list-group list-group-flush mt-2">
                                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                                            <div
                                                                style={{color: "white"}}>{
                                                                new Date(new Date(parseFloat((nftDetails?.eDate)) * 1000).getTime()).toLocaleDateString() + " " + new Date(new Date(parseFloat((nftDetails?.eDate)) * 1000).getTime()).toLocaleTimeString()
                                                            }</div>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div className="item widget-categories">
                                                    <h4 className="title">Donation Count</h4>
                                                    <ul className="list-group list-group-flush mt-2">
                                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                                            <div
                                                                style={{color: "white"}}>{nftDetails?.donationCount}</div>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div className="item widget-categories">
                                                    <h4 className="title">Max Donation Address</h4>
                                                    <ul className="list-group list-group-flush mt-2">
                                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                                            <div
                                                                style={{color: "white"}}>{nftDetails?.maxDonatorAddrs}</div>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div className="item widget-categories">
                                                    <h4 className="title">Max Donation Amount</h4>
                                                    <ul className="list-group list-group-flush mt-2">
                                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                                            <div
                                                                style={{color: "white"}}>{nftDetails?.maxDonationAmount}</div>
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
                                                    <div style={{
                                                        color: "white",
                                                        marginTop: "15px"
                                                    }}>  {nftDetails?.creatorAddr} </div>
                                                </div>

                                            </div>
                                        </div>
                                    </aside>


                                </div>
                        }
                    </div>
                </section>
            </AppLayout>
        </>
    )
}

CharityDetailsPage.requireAuth = true
export default CharityDetailsPage
