import {Link, useBreakpointValue} from "@chakra-ui/react"
import AppLayout from "../../../components/AppLayout"
import Breadcrumb from "@components/breadcrumb/Breadcrumb";

const initData = {
    sub_heading: "Contact Us",
    heading: "Get In Touch!",
    btn: "Submit Message",
    icon_1: "icon text-effect icon-location-pin m-0",
    icon_2: "icon text-effect icon-call-out m-0",
    icon_3: "icon text-effect icon-envelope-open m-0",
    title_1: "Limitless Cube",
    title_2: "Call Us",
    title_3: "Reach Us",
    address: "Samsun Teknopark, Turkey",
    map_heading: "Get Google Map Link",
    map_link: "https://www.google.com/maps/place/Samsun+Teknopark/@41.361062,36.1776393,17z/data=!3m1!4b1!4m6!3m5!1s0x40887f005ed7eb6f:0xeac58a07a907878b!8m2!3d41.361058!4d36.179828!16s%2Fg%2F11gk_2rkrd",
    name: "Yunus Emre ASLAN",
    phone_1: "yemre55@gmail.com / +90 (542) 334 34 55",
    mail_1: "info@limitlesscube.com",
    mail_2: "support@webmail.com"
}
const ContactPage = () => {

    const isMobile = useBreakpointValue({base: true, md: false})
    return (
        <>
            <AppLayout title="Contact | Crypto Moneybox">
                <Breadcrumb title="Contact Us" subpage="Pages" page="Contact"/>
                <section className="apply-area contact">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-12">
                                <div className="contact-items mt-4 mt-md-0">
                                    {/* Single Card */}
                                    <div className="card no-hover staking-card"  style={{backgroundColor:"#121117"}}>
                                        <div className="media">
                                            <i className="icon text-effect icon-location-pin m-0"/>
                                            <div className="media-body ml-4">
                                                <h2 className="m-0" style={{color:"white", fontSize: !isMobile ? "30px" : "20px", fontFamily:"Poppins", fontWeight:"800"}}>{initData.title_1}</h2>
                                                <p className="my-3" style={{color:"white"}}>{initData.address}</p>
                                                <Link className="notice" href={initData.map_link}
                                                      target="_blank">{initData.map_heading}</Link>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Single Card */}
                                    <div className="card no-hover staking-card my-4"  style={{backgroundColor:"#121117"}}>
                                        <div className="media">
                                            <i className="icon text-effect icon-call-out m-0"/>
                                            <div className="media-body ml-4">
                                                <h4 className="m-0" style={{color:"white", fontSize:!isMobile ? "30px" : "20px", fontFamily:"Poppins", fontWeight:"800"}}>{initData.title_2}</h4>
                                                <p className="m-0" style={{color:"white"}}>{initData.name}</p>
                                                <p className="d-inline-block mt-3 mb-1" style={{color:"white"}}>{initData.phone_1}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Single Card */}
                                    <div className="card no-hover staking-card"  style={{backgroundColor:"#121117"}}>
                                        <div className="media">
                                            <i className="icon text-effect icon-envelope-open m-0"/>
                                            <div className="media-body ml-4">
                                                <h4 className="m-0" style={{color:"white", fontSize:!isMobile ? "30px" : "20px", fontFamily:"Poppins", fontWeight:"800"}}>{initData.title_3}</h4>
                                                <span className="d-inline-block mt-3 mb-1" style={{color:"white"}}>{initData.mail_1}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </AppLayout>
        </>
    )
}

ContactPage.requireAuth = true
export default ContactPage
