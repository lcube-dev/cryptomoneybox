import { Box, Button, Center, Container, VStack } from "@chakra-ui/react"
import React from "react"
import { SectionHeader } from "../ui/SectionHeader"
import { useAuthContext } from "../hooks/useAuthContext"
import { useRouter } from "next/router"
export function Logout() {
  const { signOut } = useAuthContext()

  const router = useRouter()

  return (
    <Button
      p="6"
      backgroundColor="#0047FF"
      color="white"
      _hover={{ color:"black"}}
      fontSize="md"
      onClick={() => {
        signOut()
      }}
    >
      Log Out
    </Button>
  )
}
