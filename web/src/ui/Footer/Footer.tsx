import {
  Box,
  Flex,
  Heading,
  Image,
  Link as ChakraLink,
  HStack,
  IconButton,
  Button, Link,
} from "@chakra-ui/react"
import * as React from "react"
import { useAuthContext } from "../../hooks/useAuthContext"
import footerData from '../../data/footer.json';

export const Footer: React.FunctionComponent = () => {
  const { session } = useAuthContext()
  return (
      <footer className="footer-area" style={{backgroundColor:"#121117"}}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 text-center">
              {/* Footer Items */}
              <div className="footer-items">
                {/* Logo */}
                <Link className="navbar-brand" href="/">
                  <img src={footerData.img} alt="" />
                </Link>
                {/* Social Icons */}
                <div className="social-icons d-flex justify-content-center my-4">
                  {footerData.socialData.map((item, idx) => {
                    return (
                        <Link key={`fsd_${idx}`} className="facebook" href={item.link} target="_blank">
                          <i className={item.icon} />
                          <i className={item.icon} />
                        </Link>
                    );
                  })}
                </div>

                {/* Copyright Area */}
                <div className="copyright-area py-4" style={{color:"white"}}>{footerData.copyright} <Link href={footerData.ownerLink} target="_blank">{footerData.owner}</Link></div>
              </div>
            </div>
          </div>
        </div>
      </footer>
  )
}
