import { BoxProps, HStack, VStack } from "@chakra-ui/react"
import { useRouter } from "next/router"
import { SideNavItem } from "./SideNavItem"

export const SideNav = (props: BoxProps & { onChange?: () => void }) => {
  const router = useRouter()

  return (
    <VStack {...props} spacing={2}  mt="1rem" alignItems="start">
      <SideNavItem
        isActive={router.pathname == "/app/collection"}
        href="/app/collection"
        label="My NFTs"
        onChange={props.onChange}
      />
      <SideNavItem
        isActive={router.pathname == "/app/collection/created"}
        href="/app/collection/created"
        label="Create NFT"
        onChange={props.onChange}
      />
        <SideNavItem
            isActive={router.pathname == "/app/createChainCubeCollection"}
            href="/app/createChainCubeCollection"
            label="Create ChainCube Collection"
            onChange={props.onChange}
        />

        <SideNavItem
            isActive={router.pathname == "/app/createBatchMintAndList"}
            href="/app/createBatchMintAndList"
            label="Create Aid NFTs"
            onChange={props.onChange}
        />

        <SideNavItem
            isActive={router.pathname == "/app/createCharity"}
            href="/app/createCharity"
            label="Create Charity Campaign"
            onChange={props.onChange}
        />
    </VStack>
  )
}
