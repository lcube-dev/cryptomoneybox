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
const ExplorePage = () => {
    const flowUser = useFlowUser()
    const router = useRouter()

    const isMobile = useBreakpointValue({base: true, md: false})

    const [collections, setCollections] = useState([]);
    const [NFTs, setNFTs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState("Select Collection");

    const [currentPage, setCurrentPage] = useState(1);

    const currentNFTsData = useMemo(() => {
        if(NFTs.length !== 0){
            const firstPageIndex = (currentPage - 1) * 10;
            const lastPageIndex = firstPageIndex + PageSize;
            return NFTs.slice(firstPageIndex, lastPageIndex);
        }
    }, [currentPage, NFTs, selectedCollection]);

    const {
        cube_get_collections_script,
        cube_get_nft_address_by_collection_name_script,
        cube_get_nft_listing_nfts_view_script
    } = useContractCadence()

    useEffect(() => {
        (async function () {
            setIsLoading(true)
            if (cube_get_collections_script === undefined || flowUser === undefined || !flowUser?.addr) {
                setIsLoading(false)
                return
            }
            await getCollections();
        })()
    }, [flowUser?.addr, cube_get_collections_script])

    useEffect(() => {
        (async function () {
            setIsLoading(true)
            if (selectedCollection === "Select Collection" || selectedCollection === null) {
                setIsLoading(false)
                return
            }
            await getListingChainCubeNFTsViewFunc();
        })()
    }, [selectedCollection])

    const getCollections = async () => {
        try {
            const collections = await fcl.query({
                cadence: cube_get_collections_script,
                args: (arg, t) => [
                    arg("0x0d5e5c6c8bd04037", t.Address)
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
                console.log(" " + element.identifier);
            });
            setCollections(options)
            setIsLoading(false)
            return collections;
        } catch (error) {
            toast.error("An unexpected error was encountered. Try again!")
            console.log(error);
            setIsLoading(false)
        }
    }

    const getListingChainCubeNFTsViewFunc = async () => {

        try {
            const address = await fcl.query({
                cadence: cube_get_nft_address_by_collection_name_script,
                args: (arg, t) => [
                    arg(selectedCollection, t.String)
                ],
                limit: 9999,
            })

            console.log("address " + address.creatorAddress)

            const listings = await fcl.query({
                cadence: cube_get_nft_listing_nfts_view_script,
                args: (arg, t) => [
                    arg(address.creatorAddress, t.Address),
                    arg(selectedCollection, t.String)
                ],
                limit: 9999,
            })

            console.log("listings " + listings)

            setIsLoading(false)
            setNFTs(listings);
        } catch (error) {
            toast.error("An unexpected error was encountered. Try again!")
            console.log(error);
            setIsLoading(false)
        }
    }

    const handleNFT = (itemID, ownerAddr, resourceID) => {
        router.push({
            pathname: "/app/nftDetails",
            query: {itemID: itemID, ownerAddr: ownerAddr, resourceID: resourceID}
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
                                Aid Organizations
                            </Heading>
                        </div>
                        <div className="row center justify-content-center mt-5">
                            <div className="col-md-4 "></div>
                            <div className="col-md-2  " style={{paddingTop:"13px"}}> Chose Collection: </div>
                            <div className="col-md-6"><Select
                                width="250px"
                                size="xl"
                                rounded="xl"
                                value={selectedCollection}
                                style={{padding: "15px"}}
                                placeholder="Select Collection"
                                onChange={(e) => setSelectedCollection(e.target.value)}
                            >
                                {
                                    isLoading
                                        ? <Spinner size='lg' color="white"/>
                                        : collections!.map((a) => (
                                            <option
                                                key={a.value}
                                                value={a.value}>
                                                {a.label}
                                            </option>
                                        ))
                                }

                            </Select></div>

                        </div>
                    </div>

                    {
                        selectedCollection === "Select Collection"
                            ?
                            <section className="blog-area">
                                <div className="container">
                                    <div className="row items justify-content-center align-content-center">
                                        No found data!
                                    </div>
                                </div>
                            </section>
                            :
                            <section className="explore-area prev-project-area">
                                <div className="container">
                                    <div className="row">
                                        <div className="col-12">
                                            {/* Intro */}
                                            <div className="intro d-flex justify-content-between align-items-end m-0">
                                                <div className="intro-content">
                                                    <span className="intro-text"> {selectedCollection.replace("_"," ")} ({NFTs.length})</span>
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
                                                                className="item-header d-flex align-items-center mb-4 mb-md-0">
                                                                <img className="card-img-top avatar-max-lg"
                                                                     src={item.image} alt=""/>
                                                                <div className="content ml-4">
                                                                    <h4 className="m-0" style={{fontWeight:"800",fontSize:"25px"}}>{item.name.length > 25 ? item.name.substr(0,25) +"..." : item.name}</h4>
                                                                    <h6 className="m-0" style={{fontWeight:"100",fontSize:"14px"}}>
                                                                        {item.description.length > 40 ? item.description.substr(0,40) +"..." : item.description} </h6>
                                                                    <h6 className="mt-3 mb-0"> <span style={{fontWeight:"800",fontSize:"20px"}}>{parseFloat(item.price).toFixed(2)}</span> FLOW</h6>
                                                                </div>
                                                            </div>
                                                            <div className="blockchain d-inline-block mr-1 mr-md-0">
                                                                <img src="../../../../public/img/flow-icon.png" alt=""/>
                                                            </div>
                                                            <div className="single-item">
                                                                <span>#Collection: {item.setName}</span>
                                                            </div>
                                                            <div className="single-item d-none d-md-inline-block">
                                                                <span>#Owner: {item.owner}</span>
                                                            </div>
                                                            <div className="content">
                                                                <Link className="btn btn-bordered active smooth-anchor"
                                                                      onClick={() => handleNFT(item.itemID, item.owner, item.resourceID)}> View
                                                                    NFT</Link>
                                                            </div>
                                                        </div>
                                                        <Link className="project-link"
                                                              onClick={() => handleNFT(item.itemID, item.owner, item.resourceID)}/>
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
                                                pageSize="10"
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
                    }

                    {
                        NFTs.length > 0 && <Pagination
                            className="pagination-bar"
                            currentPage={currentPage}
                            totalCount={NFTs.length}
                            pageSize={PageSize}
                            onPageChange={page => setCurrentPage(page)}
                        />
                    }

                </section>
            </AppLayout>
        </>
    )
}

ExplorePage.requireAuth = true
export default ExplorePage
