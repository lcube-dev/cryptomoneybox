import AppLayout from "../../../components/AppLayout"
import Breadcrumb from "@components/breadcrumb/Breadcrumb";
import {Heading, Select, useBreakpointValue} from "@chakra-ui/react";
import React, {useState} from "react";
import {useContractCadence} from "../../../hooks/useContractCadence";
import * as fcl from "@onflow/fcl"
import toast from "react-hot-toast"
import {useFlowUser} from "../../../hooks/userFlowUser";
import DatePicker from "react-datepicker"

const initData = {
    btn: "Create Collection",
    notice: "We will create collection in the Flow Blockchain"
}

const CreateChartyPage = () => {
    const flowUser = useFlowUser()
    const isMobile = useBreakpointValue({base: true, md: false})
    const [startDate, setStartDate] = useState(new Date());
    const [name, setName] = useState(null);
    const [desc, setDesc] = useState(null);
    const [eDate, setEDate] = useState(null);
    const [targetAmount, setTargetAmount] = useState(null);
    const [donatedAddr, setDonatedAddr] = useState(null);

    const {
        cube_create_charity_script
    } = useContractCadence()

    const handleEndDate = (date) => {
        console.log("EDATE: " + new Date(date).getTime() / 1000)
        setStartDate(date)
        setEDate((new Date(date).getTime() / 1000).toFixed(1))
    }

    const createCharity = async () => {
        let toastId;
        try {

            toastId = toast.loading("Creating Charity...")
            if (name == "" || name === null) {
                toast.error("Invalid name!", {id: toastId})
                return;
            }
            if (desc.trim() == "" || desc === null) {
                toast.error("Invalid description!", {id: toastId})
                return;
            }

            const currentSecond = (new Date().getTime() / 1000);
            if (parseFloat(eDate) < currentSecond) {
                toast.error("End Date must be bigger than current date!", {id: toastId})
                return;
            }

            if (eDate == "" || eDate === null) {
                toast.error("Invalid End Date!", {id: toastId})
                return;
            }
            if (targetAmount <= 0) {
                toast.error("Invalid Target Amount!", {id: toastId})
                return;
            }
            if (donatedAddr.trim() == "" || donatedAddr === null) {
                toast.error("Invalid Donated Address!", {id: toastId})
                return;
            }

            var metadata = [
                {key: "setName", value: name},
                {key: "desc", value: desc},
                {
                    key: "image",
                    value: "https://limitlesscube.infura-ipfs.io/ipfs/Qmd1PxWiv9Rwz2TpXhvUM4YmSQ2Xx9KMob6B5yhPTHTXLU"
                },
            ];

            console.log("eDate eDate " + eDate)

            const txId = await fcl.mutate({
                cadence: cube_create_charity_script,
                args: (arg, t) => [
                    arg(name.trimEnd().toString(), t.String),
                    arg(desc.trimEnd().toString(), t.String),
                    arg(parseFloat(eDate).toFixed(1), t.UFix64),
                    arg(parseFloat(targetAmount).toFixed(1), t.UFix64),
                    arg(donatedAddr.trimEnd(), t.Address),
                    arg(metadata, t.Dictionary({key: t.String, value: t.String})),
                ],
                limit: 9999,
            })

            console.log("txId " + txId)

            await fcl.tx(txId).onceSealed().catch(err => console.log(err))
            toast.success("Successfully Create Charity Campaign", {id: toastId})
        } catch (err) {
            console.log(err)
            toast.error("cannot create charity campaign " + err, {id: toastId})
        }
    }


    return (
        <>
            <AppLayout title="Craete Collection | Crypto Moneybox">
                <section className="apply-area" style={{color: "white"}}>
                    <div className="container">
                        <div className="row justify-content-center">
                            <Heading
                                as="h1"
                                fontWeight="900"
                                textAlign="center"
                                color="white"
                                fontFamily="Poppins"
                                lineHeight="1.2"
                                fontSize={!isMobile ? "4.5rem" : "2rem"}
                            >
                                Create Charity Campaign
                            </Heading>
                        </div>
                    </div>

                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-12 col-md-8">
                                <div className="apply-form card no-hover">

                                    <form action="#">
                                        <div className="form-group">
                                            <label htmlFor="name">Name</label>
                                            <input type="text" id="name" style={{padding: "7px"}}
                                                   onChange={(e) => setName(e.target.value)}
                                                   placeholder="Charity Name"/>
                                            <small className="form-text mt-2">Enter the name of your charity</small>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="name">Description</label>
                                            <textarea  id="name" style={{padding: "7px"}}
                                                   onChange={(e) => setDesc(e.target.value)}
                                                   placeholder="Description"/>
                                            <small className="form-text mt-2">Enter the description</small>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="short-description">End Date</label>
                                            <DatePicker
                                                showIcon
                                                showTimeSelect
                                                timeFormat="HH:mm"
                                                dateFormat="dd/MM/yyyy HH:mm"
                                                selected={startDate}
                                                onChange={(date) => handleEndDate(date)}
                                            />
                                            <small className="form-text mt-2">Enter the end date for finish the
                                                charity </small>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="short-description">Target Amount</label>
                                            <input type="number" id="short-description"
                                                   onChange={(e) => setTargetAmount(e.target.value)}
                                                   style={{padding: "7px"}}
                                                   placeholder="Target Amount"/>
                                            <small className="form-text mt-2">Enter the Target Amount for finish the
                                                charity</small>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="short-description">Donate Address</label>
                                            <input type="text" id="short-description"
                                                   onChange={(e) => setDonatedAddr(e.target.value)}
                                                   style={{padding: "7px"}}
                                                   placeholder="Donate Address"/>
                                            <small className="form-text mt-2">Enter the Donate Address for transferring
                                                money </small>
                                        </div>
                                        <span className="d-inline-block">{initData.notice}</span> <br/>
                                        <button type="button" className="btn btn-bordered active mt-4"
                                                onClick={() => createCharity()}>{initData.btn} <i
                                            className="icon-login ml-2"/></button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </AppLayout>
        </>
    )
}

CreateChartyPage.requireAuth = true
export default CreateChartyPage
