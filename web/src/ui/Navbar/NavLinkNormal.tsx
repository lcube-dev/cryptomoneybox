import { chakra, HTMLChakraProps } from "@chakra-ui/react"
import Link from "next/link"
import * as React from "react"

const DesktopNavLinkNormal = ({ href = "", ...props }: HTMLChakraProps<"a">) => {
  return (
    <Link href={href} passHref  >
      <chakra.a
        fontWeight="700"
        display="flex"
        alignItems="center"
        justifyContent="center"
        transition="all 0.2s"
        _hover={{
          borderColor: "currentcolor",
          color: "content.500",
          fontWeight: "725",
        }}
        {...props}
      />
    </Link>
  )
}

export const NavLinkNormal = {
  Desktop: DesktopNavLinkNormal,
}
