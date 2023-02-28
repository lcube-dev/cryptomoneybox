import {
    Image,
    Link as ChakraLink,
    Button,
    useBreakpointValue,
    IconButton,
    Box,
    Hide,
    Show, Flex, Stack, VisuallyHidden, Heading,
} from "@chakra-ui/react"
import Link from "next/link"
import * as React from "react"
import {Navbar as NiftoryNavbar} from "./Navbar"
import {FiMenu} from "react-icons/fi"

import {FaGoogle, FaRegUser as UserIcon} from "react-icons/fa"
import {IoIosAddCircleOutline as AddIcon, IoMdGift} from "react-icons/io"
import {IoIosMegaphone as ContactIcon} from "react-icons/io"
import {IoMdGift as GiftIcon} from "react-icons/io"
import {IoIosCard as CardIcon} from "react-icons/io"
import {IoIosImage as ImageIcon} from "react-icons/io"

import {useAuthContext} from "../../hooks/useAuthContext"
import {BsDiscord} from "react-icons/bs"
import {useRouter} from "next/router"

export const Navbar = ({onOpen}) => {
    const {session, signIn, isLoading} = useAuthContext()
    let onClick = () => {
        signIn("/app/collection")
    }
    const isMobile = useBreakpointValue({base: true, md: false})
    const router = useRouter()

    const menuItems = React.useMemo(() => {
        if (!session) {
            return [
                {
                    title: "Get In",
                    component: (
                        <Button
                            rounded="3xl"
                            isLoading={isLoading}
                            cursor="pointer"
                            onClick={onClick}
                            colorScheme="white"
                            minWidth={{base: "100px", md: "180px"}}
                            fontWeight={400}
                            p={{base: "1rem", md: "1.2rem 1rem"}}
                            background="content.400"
                            fontSize={{base: "12px", md: "14px"}}
                            ml="1rem"
                            h={{base: "8", md: "10"}}
                            my="0.2rem"
                            leftIcon={<FaGoogle/>}
                        >
                            Sign in with Google
                        </Button>
                    ),
                },
                {
                    href: "https://discord.com/invite/pxEQq5xQph",
                    component: (
                        <ChakraLink
                            href="https://discord.com/invite/pxEQq5xQph"
                            target="_blank"
                            color="content.400"
                            fontWeight="bold"
                            display="flex"
                            alignItems="center"
                            mt="0.1rem"
                        >
                            <BsDiscord size="2rem" color="#2D3436"/>
                        </ChakraLink>
                    ),
                },
            ]
        } else {
            return [
                {
                    title: "New Collection",
                    href: "/",
                    component: (
                        <Link href="/app/explore" passHref>
                            <ChakraLink
                                fontWeight="bold"
                                display="flex"
                                alignItems="center"
                                gap="0.3rem"
                                variant="custom"
                            >
                                <ImageIcon
                                    style={{"color": "white", "fontSize": "25px", "marginRight": "5px"}}/>
                                <Hide below="md">
                                    <div style={{"color": "white"}}>Explore</div>
                                </Hide>
                            </ChakraLink>
                        </Link>
                    ),
                },
                {
                    title: "New Collection",
                    href: "/",
                    component: (
                        <Link href="/app/charities" passHref>
                            <ChakraLink
                                fontWeight="bold"
                                display="flex"
                                alignItems="center"
                                gap="0.3rem"
                                variant="custom"
                            >
                                <GiftIcon size={20} color="white"/>
                                <Hide below="md">
                                    <div style={{"color": "white"}}>Charity</div>
                                </Hide>
                            </ChakraLink>
                        </Link>
                    ),
                },
                {
                    title: "New Collection",
                    href: "/",
                    component: (
                        <Link href="/app/collection" passHref>
                            <ChakraLink
                                fontWeight="bold"
                                display="flex"
                                alignItems="center"
                                color="white"
                                gap="0.3rem"
                            >
                                <CardIcon size={20} color="white"/>
                                <Hide below="md">
                                    <div style={{color: "white"}}> My Collection</div>
                                </Hide>
                            </ChakraLink>
                        </Link>
                    ),
                },
                {
                    title: "New Item",
                    href: "/app/new-item",
                    component: (
                        <Link href="/app/new-item" passHref>
                            <ChakraLink
                                fontWeight="bold"
                                display="flex"
                                alignItems="center"
                                color="content.100"
                                gap="0.3rem"
                            >
                                <AddIcon color="white" size={25}/>
                                <Hide below="md">
                                    <div style={{color: "white"}}> Create</div>
                                </Hide>
                            </ChakraLink>
                        </Link>
                    ),
                },
                {
                    href: "/app/account",
                    component: (
                        <Link href="/app/account" passHref>
                            <ChakraLink
                                fontWeight="bold"
                                display="flex"
                                alignItems="center"
                                color="content.400"
                                gap="0.3rem"
                            >
                                <UserIcon color="white" size={20}/>
                                <Hide below="md">
                                    <div style={{color: "white"}}>Account</div>
                                </Hide>
                            </ChakraLink>
                        </Link>
                    ),
                },
                {
                    title: "Contact",
                    href: "/",
                    component: (
                        <Link href="/app/contact" passHref>
                            <ChakraLink
                                fontWeight="bold"
                                display="flex"
                                alignItems="center"
                                gap="0.3rem"
                                variant="custom"
                            >
                                <ContactIcon size={20} color="white"/>
                                <Hide below="md">
                                    <div style={{"color": "white"}}>Contact</div>
                                </Hide>
                            </ChakraLink>
                        </Link>
                    ),
                },
                {
                    href: "https://discord.com/invite/pxEQq5xQph",
                    component: (
                        <ChakraLink
                            ml={{md: "1rem"}}
                            mt="0.1rem"
                            href="https://discord.com/invite/pxEQq5xQph"
                            target="_blank"
                            color="content.400"
                            fontWeight="bold"
                            display="flex"
                            alignItems="center"
                            gap="0.3rem"
                        >
                            <BsDiscord size="1.5rem" color="#fff"/>
                        </ChakraLink>
                    ),
                },
            ]
        }
    }, [session])

    return (
        <>
            <NiftoryNavbar
                leftComponent={
                    <>
                        {isMobile && session && (
                            <IconButton
                                variant="outline"
                                onClick={onOpen}
                                aria-label="open menu"
                                icon={<FiMenu color="white"/>}
                            />
                        )}
                        <Link href="/" passHref style={{paddingRight: "-40px"}}>
                            <Image
                                src="/img/logo.png"
                                alt="logo"
                                zIndex="1000"
                                width="45px"
                                height="55px"
                                py="4px"
                            />
                        </Link>
                        {!isMobile && (
                            <Heading
                                as="h3"
                                fontWeight="400"
                                alignContent="center"
                                paddingTop="20px"
                                fontFamily="Poppins"
                                letterSpacing="5px"
                                fontSize={{base: "1xl", md: "2xl"}}
                            >
                                Crypto Moneybox
                            </Heading>
                        )}


                    </>
                }
                menu={menuItems}
            />
        </>
    )
}
