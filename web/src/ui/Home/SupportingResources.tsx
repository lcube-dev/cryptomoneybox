import {Box, Image, Heading, VStack, Text, Flex, Link as ChakraLink} from "@chakra-ui/react"
import {BsDiscord} from "react-icons/bs"
import {CgFileDocument} from "react-icons/cg"

const ResourceCard = ({icon, title, body}) => {
    return (
        <VStack p="3rem" bgColor="white" rounded="3xl" flex="1" textAlign="center" shadow="base">
            <Box p="1.2rem" rounded="full" color="white" bgColor="content.400">
                {icon}
            </Box>
            <Heading fontSize="2xl" pt="0.4rem" color="content.400">
                {title}
            </Heading>
            <Text pt="0.3rem">{body}</Text>
        </VStack>
    )
}

export const SupportingResources = () => {
    return (
        <Box
            color="content.400"
            mt={{base: "2rem", md: "10rem"}}
            maxW={{md: "800px", lg: "1000px"}}
            mx={{base: "1rem", md: "0"}}
        >
            <Heading size="1rem"
                     fontFamily="Poppins"
                     textAlign="center"
                     fontSize={{base: "3xl", md: "5xl"}}>
                Supporting Resources
            </Heading>
            <Flex
                gap={{base: "1rem", md: "2rem"}}
                mt={{base: "1rem", md: "3rem"}}
                direction={{base: "column", md: "row"}}
            >
                <ResourceCard
                    title="Donation"
                    icon={<i className="icon-shuffle" style={{ fontSize:"xx-large"}}/>}
                    body={
                        <>
                            <ChakraLink href="/app/charities" color="purple.100">
                                Donate {" "}
                            </ChakraLink>
                            by participating in the donation campaigns opened on the Donate page. The highest donor
                            wins the nft in the fundraiser.
                        </>
                    }
                />
                <ResourceCard
                    title="Buy NFT"
                    icon={<CgFileDocument size="2.5rem"/>}
                    body={
                        <>
                            Contribute by purchasing nft from the {" "}
                            <ChakraLink href="/app/explore" color="purple.100">
                                Explore
                            </ChakraLink>{" "} page. Help those in need by buying Nft
                        </>
                    }
                />
                <ResourceCard
                    title="Help"
                    icon={
                        <Box mt="0.1rem">
                            <BsDiscord size="2.5rem"/>
                        </Box>
                    }
                    body={
                        <>
                            Get more help from the  {" "}
                            <ChakraLink href="/app/contact" color="purple.100">
                                Contact{" "}
                            </ChakraLink>
                            page
                        </>
                    }
                />
            </Flex>
        </Box>
    )
}
