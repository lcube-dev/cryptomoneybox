import AppLayout from "../../../components/AppLayout"
import {Heading, Link, Select, Spinner, useBreakpointValue} from "@chakra-ui/react";
import React, {useEffect, useMemo, useState} from "react";
import * as fcl from "@onflow/fcl";
import {useContractCadence} from "../../../hooks/useContractCadence";
import {useFlowUser} from "../../../hooks/userFlowUser";
import toast from "react-hot-toast";
import {useRouter} from "next/router";


const CharityDetailsPage = () => {
    const flowUser = useFlowUser()
    const router = useRouter()
    const {query} = useRouter();
    const isMobile = useBreakpointValue({base: true, md: false})

    const [txs, setTxs] = useState([]);
    const [nftDetails, setNftDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [doneters, setDonaters] = useState([]);

    const [donate, setDonate] = useState(null);
    const [isLoadingDonate, setIsLoadingDonate] = useState(false);
    const {donate_script, cube_get_donaters} = useContractCadence()

    useEffect(() => {
        (async function () {
            setIsLoading(true)
            if (cube_get_donaters === undefined) {
                return
            }
            if (query?.item === "") {
                return
            }
            const data = query?.item
            if (typeof data === "string") {
                setNftDetails(JSON.parse(data).data)
                await getDonaters(JSON.parse(data).data.creatorAddr, JSON.parse(data).data.id)
            }
            setIsLoading(false)
        })()
    }, [query, cube_get_donaters])


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
            await getDonaters(addr, id)
            setIsLoadingDonate(false)
        } catch (error) {
            toast.error("An unexpected error was encountered. Try again!", {id: toastId})
            setIsLoadingDonate(false)
        }
    }


    const getDonaters = async (creatorAddr, id) => {
        let toastId;
        try {
            const donaters = await fcl.query({
                cadence: cube_get_donaters,
                args: (arg, t) => [
                    arg(creatorAddr.toString(), t.Address),
                    arg(parseInt(id.toString()), t.UInt64)
                ],
                limit: 9999,
            })

            setDonaters(donaters)
        } catch (error) {
            toast.error("An unexpected error was encountered. Try again!", {id: toastId})
            console.log(error);
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
                                            <Spinner size="xl" color="white"/>
                                        </div>
                                    </div>
                                </section>
                                :
                                <>
                                    <div className="row">
                                        {/* Main */}
                                        <div className="col-12 col-lg-8 p-0">
                                            <div className="row">
                                                <div className="col-12 align-self-center">
                                                    {/* Image */}
                                                    <div className="blog-thumb">
                                                        <img className="w-100" src={nftDetails?.nftMetadata.image}
                                                             alt=""/>
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
                                                                            onClick={() => donateFunc(nftDetails?.id, nftDetails?.creatorAddr)}>
                                                                            Donate
                                                                        </Link>
                                                                }


                                                            </div>

                                                            <h1 className="text-center mt-5 ml-4" style={{width:"100%", fontSize:"25px"}}> All Donations</h1>
                                                            {
                                                                doneters.map((a,i) =>
                                                                    <>
                                                                       <span style={{color:"white", display:"grid", justifyContent:"center", alignContent:"center", fontSize:"20px"}}> {i+1}. </span>
                                                                        <div className="row mt-2" style={{color:"white", width: "80%"}}>
                                                                             <div className="col-md-6">
                                                                                {a.addr}
                                                                            </div>
                                                                            <div className="col-md-6">
                                                                                {a.amount} FLOW
                                                                            </div>
                                                                        </div>
                                                                    </>

                                                                )
                                                            }


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
                                                                    style={{color: "white"}}>{parseFloat(nftDetails?.targetAmount).toFixed(1)} FLOW
                                                                </div>
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
                                                        <h4 className="title">Total Donation Amount</h4>
                                                        <div style={{
                                                            color: "white",
                                                            marginTop: "15px"
                                                        }}>  {nftDetails?.totalDonationAmount} </div>
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

                                                </div>
                                            </div>
                                        </aside>
                                    </div>

                                </>

                        }
                    </div>
                </section>
            </AppLayout>
        </>
    )
}

CharityDetailsPage.requireAuth = true
export default CharityDetailsPage
