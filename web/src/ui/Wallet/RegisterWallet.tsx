import {useEffect, useState} from "react"
import * as fcl from "@onflow/fcl"
import {useFlowUser} from "hooks/userFlowUser"
import {useGraphQLMutation} from "graphql/useGraphQLMutation"
import {
    RegisterWalletDocument,
    RegisterWalletMutation,
    RegisterWalletMutationVariables,
} from "../../../generated/graphql"
import {Button} from "@chakra-ui/react"
import {useAuthContext} from "../../hooks/useAuthContext";

interface Props {
    onRegister?: () => void
}

export function RegisterWallet({onRegister}: Props) {
    const flowUser = useFlowUser()

    const {executeMutation: registerWallet} = useGraphQLMutation<RegisterWalletMutation,
        RegisterWalletMutationVariables>(RegisterWalletDocument)

    // When the user logs in, register their wallet. This is because we need to register after fcl.login and it doesn't return a promise.
    useEffect(() => {
        if (flowUser === undefined || !flowUser?.addr) {
            return
        }

        registerWallet({address: flowUser?.addr}).then(() => {
                onRegister?.()
            }
        )
    }, [flowUser?.addr, flowUser?.loggedIn])

    const handleRegister = async () => {
        fcl.unauthenticate()
        fcl.logIn()
    }

    return (
        <Button px="4" py="2" size="md" onClick={handleRegister}>


            Add your wallet


        </Button>
    )
}
