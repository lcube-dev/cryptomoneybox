import AppLayout from "../components/AppLayout"
import {Center, Heading, Link, useBreakpointValue} from "@chakra-ui/react"

import React from "react"
import {SupportingResources} from "ui/Home/SupportingResources"

const HomePage = () => {
    const isMobile = useBreakpointValue({base: true, md: false})
    const initData = {
        sub_heading: "Crypto Moneybox",
        heading: "Contribute to Donation Campaigns",
        content: "Buy NFT and Donate, The Highest Donor The Owner of the NFT"
    }

    return (
        <AppLayout>
            <section className="hero-section m-0 p-0">
                <div className="container">
                    <div className="row align-items-center justify-content-center">
                        <div className="col-12 col-md-6 col-lg-9 text-center">
                            {/* Hero Content */}
                            <div className="hero-content mt-5">
                                <div className="intro text-center mb-5">
                                    <span className="intro-text mt-5 mb-3" style={{
                                        fontSize: "25px",
                                        fontFamily: "Poppins"
                                    }}>{initData.sub_heading}</span>
                                    <Heading
                                        as="h1"
                                        fontWeight="900"
                                        textAlign="center"
                                        fontFamily="Poppins"
                                        lineHeight="1.2"
                                        fontSize={!isMobile ? "4.5rem" : "2rem"}
                                    >
                                        {initData.heading}
                                    </Heading>
                                    <Heading
                                        as="h3"
                                        fontWeight="200"
                                        textAlign="center"
                                        paddingTop="7px"
                                        fontSize={!isMobile ? "1.2rem" : "0.8rem"}
                                    >
                                        {initData.content}
                                    </Heading>
                                </div>
                                {/* Buttons */}
                                <div className="button-group">
                                    <Link className="btn btn-bordered active smooth-anchor" href="/app/charities"><i
                                        className="icon-rocket mr-2"/>Donate Campaigns</Link>
                                    <Link className="btn btn-bordered active smooth-anchor" href="/app/explore"><i
                                        className="icon-note mr-2"/>Buy NFT</Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Center py={{base: "1rem"}} flexDir="column" position="relative">

                            <SupportingResources/>

                        </Center>

                    </div>
                </div>
            </section>


        </AppLayout>
    )
}

export default HomePage
