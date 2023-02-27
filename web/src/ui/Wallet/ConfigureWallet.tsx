import {Button, useDisclosure, Text, Tag, Spinner} from "@chakra-ui/react"
import {useGraphQLMutation} from "graphql/useGraphQLMutation"
import {useFlowAccountConfiguration} from "hooks/userFlowAccountConfiguration"
import {useFlowUser} from "hooks/userFlowUser"
import React, {useEffect, useState} from "react"
import {ReadyWalletDocument, Wallet} from "../../../generated/graphql"
import {WalletSetupBox} from "./WalletSetupBox"
import * as fcl from "@onflow/fcl"
import {AlertModal} from "ui/Modal/AlertModal"
import {getColorFromWalletState, getReadableWalletState} from "../../utils/wallet";
import toast from "react-hot-toast";

interface Props {
    wallet: Wallet
    onReady?: () => void
}

export function ConfigureWallet({wallet, onReady}: Props) {
    const flowUser = useFlowUser()

    const [isSetupChainCube, setIsSetupChainCube] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


    const {executeMutation: readyWallet} = useGraphQLMutation(ReadyWalletDocument)
    const {configured, isCubeConfigured, configure, cubeConfigured} = useFlowAccountConfiguration()

    // Once the wallet is configured, call the ready mutation to tell Niftory it's ready to receive NFTs
    useEffect(() => {
        if (!configured || wallet.address != flowUser?.addr) {
            return
        }

        readyWallet({address: flowUser?.addr}).then(onReady)
    }, [flowUser?.addr, configured])

    const alertDisclosure = useDisclosure()

    const setupUser = () => {
        setIsLoading(true)
        cubeConfigured()
            .then(r => {
                setIsSetupChainCube(true)
                setIsLoading(false)
            })
            .catch(err => {
                setIsSetupChainCube(true)
                setIsLoading(false)
                toast.error("Cannot configure with chain cube!")
            })

    }

    return (
        <>
            {
                !isSetupChainCube &&
                <>
                    <Button px="4" py="2" size="sm" onClick={() => configure} color="black">
                        Configure Niftory
                    </Button>
                    {
                        isLoading
                            ? <Spinner size='lg'/>
                            : <Button px="4" py="2" size="sm" onClick={() => setupUser()} color="black">
                                Configure Cube Chain
                            </Button>
                    }
                </>
            }

            {
                isSetupChainCube &&
                <Tag
                    size="sm"
                    fontSize="0.7rem"
                    bgColor="green.400"
                    color="white"
                >
                    Chain Cube Ready
                </Tag>
            }
        </>
    )
}
