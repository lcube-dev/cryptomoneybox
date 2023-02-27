import AppLayout from "../../../components/AppLayout"
import {Heading, Link, Select, Spinner, useBreakpointValue} from "@chakra-ui/react";
import React, {useEffect, useMemo, useState} from "react";
import * as fcl from "@onflow/fcl";
import {useContractCadence} from "../../../hooks/useContractCadence";
import {useFlowUser} from "../../../hooks/userFlowUser";
import toast from "react-hot-toast";
import {useRouter} from "next/router";
import Pagination from "../../../ui/Pagination";

let PageSize = 10;
const CharitiesPage = () => {
    const flowUser = useFlowUser()
    const router = useRouter()

    const isMobile = useBreakpointValue({base: true, md: false})

    const [NFTs, setNFTs] = useState([]);
    const [donate, setDonate] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingDonate, setIsLoadingDonate] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState("Select Collection");

    const [currentPage, setCurrentPage] = useState(1);

    const currentNFTsData = useMemo(() => {
        if (NFTs.length !== 0) {
            const firstPageIndex = (currentPage - 1) * 10;
            const lastPageIndex = firstPageIndex + PageSize;
            return NFTs.slice(firstPageIndex, lastPageIndex);
        }
    }, [currentPage, NFTs, selectedCollection]);

    const {
        cube_get_all_charity_script,
        donate_script
    } = useContractCadence()

    useEffect(() => {
        (async function () {
            setIsLoading(true)
            if (cube_get_all_charity_script === undefined || flowUser === undefined || !flowUser?.addr) {
                return
            }
            await getCharities();
        })()
    }, [flowUser?.addr, cube_get_all_charity_script])

    const getCharities = async () => {
        try {
            const charities = await fcl.query({
                cadence: cube_get_all_charity_script,
                limit: 9999,
            })
            console.log("charities data " + charities)

            const charitiesActive = []
            charities.forEach(element => {
                const currentSecond = (new Date().getTime() / 1000);
                if (parseFloat(element.eDate) > currentSecond && parseFloat(element.totalDonationAmount) < parseFloat(element.targetAmount)) {
                    charitiesActive.push(element)
                }
                console.log("element " + element);
            });

            setNFTs(charitiesActive)
            setIsLoading(false)
        } catch (error) {
            toast.error("An unexpected error was encountered. Try again!")
            console.log(error);
            setIsLoading(false)
        }
    }

    const donateFunc = async (id) => {
        let toastId;
        try {
            setIsLoadingDonate(true)
            const donateTx = await fcl.mutate({
                cadence: donate_script,
                args: (arg, t) => [
                    arg(parseFloat(donate).toFixed(5), t.UFix64),
                    arg(flowUser?.addr, t.Address),
                    arg(parseInt(id.toString()), t.UInt64)
                ],
                limit: 9999,
            })
            await fcl.tx(donateTx).onceSealed()
            toast.success("Successfully Donate! Thank you", {id: toastId})
            setIsLoadingDonate(false)
        } catch (error) {
            toast.error("An unexpected error was encountered. Try again!", {id: toastId})
            console.log(error);
            setIsLoadingDonate(false)
        }
    }

    const handleNFT = (item) => {
        const data = {data: item}
        router.push({
            pathname: "/app/charityDetails",
            query: {item: JSON.stringify(data)}
        })
    }

    return (
        <>
            <AppLayout title="Explore | Crypto Moneybox">
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
                                marginBottom="7px"
                                fontSize={!isMobile ? "4.5rem" : "2rem"}
                            >
                                All Charities
                            </Heading>
                        </div>
                    </div>

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
                            <>
                                {
                                    NFTs.length > 0 ?
                                        <section className="explore-area prev-project-area">
                                            <div className="container">
                                                <div className="row">
                                                    <div className="col-12">
                                                        <div
                                                            className="intro d-flex justify-content-between align-items-end m-0">
                                                            <div className="intro-content">
                                                                <span
                                                                    className="intro-text"> CHARITIES ({NFTs.length})</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row items">
                                                    {currentNFTsData?.map((item, idx) => {
                                                        return (
                                                            <div key={`pdt_${idx}`} className="col-12 item">
                                                                <div className="card project-card prev-project-card">
                                                                    <div
                                                                        className="project-content d-md-flex flex-column flex-md-row align-items-center justify-content-md-between">
                                                                        <div
                                                                            className="item-header d-flex align-items-center mb-4 mb-md-0"
                                                                            style={{width: isMobile ? "100%" : "50%"}}>
                                                                            <img className="card-img-top avatar-max-lg"
                                                                                 src={item.nftMetadata.image} alt=""/>
                                                                            <div className="content ml-4"
                                                                                 style={{width: "100%"}}>
                                                                                <div className="row mt-3">
                                                                                    <h4 className="m-0" style={{
                                                                                        fontWeight: "800",
                                                                                        fontSize: "25px"
                                                                                    }}>{item.name.length > 25 ? item.name.substr(0,25) +"..." : item.name}</h4>
                                                                                </div>
                                                                                <div className="row mt-3">
                                                                                    <h6 className="m-0" style={{
                                                                                        fontWeight: "100",
                                                                                        fontSize: "14px"
                                                                                    }}>{item.desc.length > 40 ? item.desc.substr(0,40) +"..." : item.desc}</h6>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="row">
                                                                            <div className="row">
                                                                                <div className="single-item">
                                                                                    <span><span
                                                                                        style={{fontWeight: "100"}}>#Donate Address:</span> {item.donatedAddr}</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="row">
                                                                                <div
                                                                                    className="single-item  ">
                                                                                    <span><span
                                                                                        style={{fontWeight: "100"}}>#Owner: </span> {item.creatorAddr}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="row">
                                                                            <div className="col-md-6 pl-0">
                                                                                <Link
                                                                                    className="btn btn-bordered active smooth-anchor "
                                                                                    onClick={() => handleNFT(item)}> Donate</Link>
                                                                            </div>
                                                                            <Link className="project-link"
                                                                                  onClick={() => handleNFT(item)}/>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="row mt-4 mt-md-5">
                                                    <div className="col-12">
                                                        <Pagination
                                                            className="pagination-bar"
                                                            currentPage={currentPage}
                                                            totalCount={NFTs.length}
                                                            pageSize={PageSize}
                                                            onPageChange={page => setCurrentPage(page)}
                                                        />

                                                        {/*<nav>*/}
                                                        {/*    <ul className='page-numbers'>*/}
                                                        {/*        <li><span aria-current="page"*/}
                                                        {/*                  className="page-numbers current">1</span></li>*/}
                                                        {/*        <li><Link className="page-numbers" href="#">2</Link></li>*/}
                                                        {/*        <li><span className="page-numbers dots">&hellip;</span></li>*/}
                                                        {/*        <li><Link className="page-numbers" href="#">4</Link></li>*/}
                                                        {/*        <li><Link className="next page-numbers" href="#"><i*/}
                                                        {/*            className="icon-arrow-right"></i></Link></li>*/}
                                                        {/*    </ul>*/}
                                                        {/*</nav>*/}

                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                        :
                                        <section className="blog-area">
                                            <div className="container">
                                                <div className="row items justify-content-center align-content-center">
                                                    No found data!
                                                </div>
                                            </div>
                                        </section>

                                }
                            </>
                    }

                </section>
            </AppLayout>
        </>
    )
}

CharitiesPage.requireAuth = true
export default CharitiesPage
