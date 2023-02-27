import React, {useEffect} from "react"
import {SessionProvider} from "next-auth/react"
import favicon from "../../public/img/favicon.png";
import {ChakraProvider} from "@chakra-ui/react"
import {AppProps as NextAppProps} from "next/app"
import {AuthProvider} from "../components/AuthProvider"
import {ComponentWithAuth} from "../components/ComponentWithAuth"
import {GraphQLClientProvider} from "../components/GraphQLClientProvider"
import theme from "../lib/chakra-theme"
import '../../public/assets/css/style.css'
import '../../public/assets/css/pagination.css';
import "react-datepicker/dist/react-datepicker.css";
import {Toaster} from "react-hot-toast"
import Head from "next/head"
import {useRouter} from "next/router"
import Script from 'next/script'

type AppProps<P = {}> = NextAppProps<P> & {
    Component: ComponentWithAuth
}

const App = ({Component, pageProps: {session, auth, ...pageProps}}: AppProps): JSX.Element => {
    const router = useRouter()
    useEffect(() => {
        const handleRouteChange = () => {
            if (typeof window !== "undefined") {

            }
        }

        router.events.on("routeChangeComplete", handleRouteChange)

        return () => {
            router.events.off("routeChangeComplete", handleRouteChange)
        }
    }, [router.events])

    return (
        <>
            <Head>
                <title>Crypto Moneybox</title>
                <link rel="manifest" href="/favicon/site.webmanifest"/>
                <meta name="msapplication-config" content="/favicon/browserconfig.xml"/>
                <meta name="msapplication-TileColor" content="#ffffff"/>
                <meta name="theme-color" content="#ffffff"/>
                <link rel="icon" href="../../public/img/favicon.ico" type="image/png"/>
            </Head>

                <SessionProvider session={session} refetchInterval={60 * 60}>
                    <AuthProvider requireAuth={Component.requireAuth}>
                        <Toaster/>
                        <GraphQLClientProvider>
                            <ChakraProvider theme={theme}>
                                <Component {...pageProps} />
                            </ChakraProvider>
                        </GraphQLClientProvider>
                    </AuthProvider>
                </SessionProvider>


            <Script
                src="../../public/assets/js/vendor/core.min.js"
                strategy="worker"
            />

            {/* <!-- Swiper js --> */}
            <Script
                src="https://cdnjs.cloudflare.com/ajax/libs/Swiper/9.0.5/swiper-bundle.min.js"
                strategy="worker"
            />
            {/* <!-- Bootstrap js --> */}
            <Script
                src="../../public/assets/js/vendor/popper.min.js"
                strategy="worker"
            />
            <Script
                src="../../public/assets/js/vendor/bootstrap.min.js"
                strategy="worker"
            />

            {/* <!-- Plugins js --> */}
            <Script
                src="../../public/assets/js/vendor/all.min.js"
                strategy="worker"
            />
            <Script
                src="../../public/assets/js/vendor/gallery.min.js"
                strategy="worker"
            />
            <Script
                src="../../public/assets/js/vendor/slider.min.js"
                strategy="worker"
            />
            <Script
                src="../../public/assets/js/vendor/countdown.min.js"
                strategy="worker"
            />
            <Script
                src="../../public/assets/js/vendor/shuffle.min.js"
                strategy="worker"
            />

            {/* <!-- Core js --> */}
            <Script
                src="../../public/assets/js/main.js"
                strategy="worker"
            />

        </>
    )
}

export default App
