import router, {useRouter} from "next/router"
import Masonry from "react-masonry-css"
import {
    UserNftsQuery,
    UserNftsQueryVariables,
    UserNftsDocument,
    Nft,
    NftModel,
} from "../../../generated/graphql"
import {useGraphQLQuery} from "../../graphql/useGraphQLQuery"
import {useAuthContext} from "../../hooks/useAuthContext"
import {MasonryCard} from "../../ui/Card/MasonryCard"
import {Empty} from "../../ui/Empty/Empty"
import {LoginSkeleton} from "../../ui/Skeleton"
import {useFlowUser} from "../../hooks/userFlowUser";
import {Center, Heading, Link, Spinner, useBreakpointValue} from "@chakra-ui/react";
import {useContractCadence} from "../../hooks/useContractCadence";
import React, {useEffect, useState} from "react";
import * as fcl from "@onflow/fcl";
import toast from "react-hot-toast";

export const UserNFTCollection = () => {
    const {isLoading} = useAuthContext()
    const flowUser = useFlowUser()
    const router = useRouter()

    const [NFTs, setNFTs] = useState([]);
    const [isLoadings, setIsLoadings] = useState(true);

    const {
        cube_get_nfts_view_by_address_script
    } = useContractCadence()

    useEffect(() => {
        (async function () {
            setIsLoadings(true)
            if (cube_get_nfts_view_by_address_script === undefined || flowUser === undefined || !flowUser?.addr) {
                return
            }
            await getNFT();
        })()
    }, [flowUser?.addr, cube_get_nfts_view_by_address_script])


    const getNFT = async () => {
        try {
            const nfts = await fcl.query({
                cadence: cube_get_nfts_view_by_address_script,
                args: (arg, t) => [
                    arg(flowUser?.addr, t.Address)
                ],
                limit: 9999,
            })
            setNFTs(nfts);
            console.log(nfts)
            setIsLoadings(false)
        } catch (error) {
            toast.error("An unexpected error was encountered. Try again!")
            console.log(error);
            setIsLoadings(false)
        }
    }


    const {
        nfts,
        fetching: fetchingNfts,
        reExecuteQuery,
    } = useGraphQLQuery<UserNftsQuery, UserNftsQueryVariables>({
        query: UserNftsDocument,
        requestPolicy: "network-only",
        pause: isLoading,
    })

    if (fetchingNfts) {
        return <LoginSkeleton/>
    }

    if (!fetchingNfts && nfts?.items?.length == 0) {
        return (
            <>
                <Empty
                    message="You haven't minted anything yet!"
                    actionText="Mint an NFT"
                    onAction={() => router.push("/app/new-item")}
                />

                {
                    isLoadings
                        ?
                        <Center w="full">
                            <Spinner size="xl" color="white"/>
                        </Center>
                        :
                        <>
                            <section className="explore-area prev-project-area ">
                                <div className="container ml-5" style={{width: "75%"}}>
                                    <Heading fontWeight="bold" fontSize="2xl">
                                        Chain Cube NFTs
                                    </Heading>
                                    <div className="row items">
                                        {NFTs?.map((item, idx) => {
                                            return (
                                                <div key={`pdt_${idx}`} className="col-12 item">
                                                    <div className="card project-card prev-project-card">
                                                        <div
                                                            className="project-content d-md-flex flex-column flex-md-row align-items-center justify-content-md-between">
                                                            <div
                                                                className="item-header d-flex align-items-center mb-4 mb-md-0">
                                                                <img className="card-img-top avatar-max-lg"
                                                                     src={item.metadata.image} alt=""/>
                                                                <div className="content ml-4">
                                                                    <h4 className="m-0" style={{
                                                                        fontWeight: "800",
                                                                        fontSize: "25px"
                                                                    }}>{item.name}</h4>
                                                                    <h6 className="m-0" style={{
                                                                        fontWeight: "100",
                                                                        fontSize: "14px"
                                                                    }}>{item.description}</h6>
                                                                </div>
                                                            </div>
                                                            <div className="blockchain d-inline-block mr-1 mr-md-0">
                                                                <img src="../../../public/img/flow-icon.png" alt=""/>
                                                            </div>
                                                            <div className="single-item">
                                                                <span>#Collection: {item.metadata.setName.replace("_", "")}</span>
                                                            </div>
                                                            <div className="single-item d-none d-md-inline-block">
                                                                <span>#NFT Type: {item.metadata.nftType}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="row mt-4 mt-md-5">
                                        <div className="col-12">
                                            {
                                                NFTs.length > 0 &&
                                                <nav>
                                                    <ul className='page-numbers'>
                                                        <li><span aria-current="page"
                                                                  className="page-numbers current">1</span></li>
                                                        <li><Link className="page-numbers" href="#">2</Link></li>
                                                        <li><span className="page-numbers dots">&hellip;</span></li>
                                                        <li><Link className="page-numbers" href="#">4</Link></li>
                                                        <li><Link className="next page-numbers" href="#"><i
                                                            className="icon-arrow-right"></i></Link></li>
                                                    </ul>
                                                </nav>
                                            }

                                        </div>
                                    </div>
                                </div>
                            </section>
                        </>
                }
            </>

        )
    }

    return (
        <>
            <Heading fontWeight="bold" fontSize="2xl" paddingTop="50px" paddingRight="30px" marginLeft="40px">
                Niftory NFTS
            </Heading>
            <Masonry
                breakpointCols={{
                    default: 4,
                    1100: 3,
                    700: 2,
                    500: 1,
                }}
                style={{"marginTop": "50px", "marginLeft": "20px"}}
                className="masonry-grid ml-5"
                columnClassName="masonry-grid_column"
            >
                {nfts?.items?.map((nft) => {
                    return (
                        <MasonryCard
                            key={nft?.id}
                            nftModel={nft.model as NftModel}
                            nft={nft as Nft}
                            reExecuteQuery={reExecuteQuery}
                        />
                    )
                })}
            </Masonry>

            {
                isLoadings
                    ?
                    <Center w="full">
                        <Spinner size="xl" color="white"/>
                    </Center>
                    :
                    <>
                        <section className="explore-area prev-project-area ">
                            <div className="container ml-5" style={{width: "75%"}}>
                                <Heading fontWeight="bold" fontSize="2xl">
                                    Chain Cube NFTs
                                </Heading>
                                <div className="row items">
                                    {NFTs?.map((item, idx) => {
                                        return (
                                            <div key={`pdt_${idx}`} className="col-12 item">
                                                <div className="card project-card prev-project-card">
                                                    <div
                                                        className="project-content d-md-flex flex-column flex-md-row align-items-center justify-content-md-between">
                                                        <div
                                                            className="item-header d-flex align-items-center mb-4 mb-md-0">
                                                            <img className="card-img-top avatar-max-lg"
                                                                 src={item.metadata.image} alt=""/>
                                                            <div className="content ml-4">
                                                                <h4 className="m-0" style={{
                                                                    fontWeight: "800",
                                                                    fontSize: "25px"
                                                                }}>{item.name}</h4>
                                                                <h6 className="m-0" style={{
                                                                    fontWeight: "100",
                                                                    fontSize: "14px"
                                                                }}>{item.description}</h6>
                                                            </div>
                                                        </div>
                                                        <div className="blockchain d-inline-block mr-1 mr-md-0">
                                                            <img src="../../../public/img/flow-icon.png" alt=""/>
                                                        </div>
                                                        <div className="single-item">
                                                            <span>#Collection: {item.metadata.setName.replace("_", "")}</span>
                                                        </div>
                                                        <div className="single-item d-none d-md-inline-block">
                                                            <span>#NFT Type: {item.metadata.nftType}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="row mt-4 mt-md-5">
                                    <div className="col-12">
                                        {
                                            NFTs.length > 0 &&
                                            <nav>
                                                <ul className='page-numbers'>
                                                    <li><span aria-current="page"
                                                              className="page-numbers current">1</span></li>
                                                    <li><Link className="page-numbers" href="#">2</Link></li>
                                                    <li><span className="page-numbers dots">&hellip;</span></li>
                                                    <li><Link className="page-numbers" href="#">4</Link></li>
                                                    <li><Link className="next page-numbers" href="#"><i
                                                        className="icon-arrow-right"></i></Link></li>
                                                </ul>
                                            </nav>
                                        }

                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
            }


        </>
    )
}
