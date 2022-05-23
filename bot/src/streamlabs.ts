import ioV2 from "socket.io-client-v2"
import socket from "./socket-client"

interface IDonationEvent {
  id: number
  name: string
  amount: number
  formatted_amount: string
  formattedAmount: string
  message: string
  currency: string
  emotes?: string
  iconClassName: string
  to: { name: string }
  from: string
  from_user_id?: string
  skip_alert: boolean
  _id: string
  priority: number
}

const io = socket()
const socketToken = process.env.STREAMLABS_SOCKET_TOKEN

export default function streamlabs() {
  //Connect to socket
  const streamlabsSocket = ioV2(
    `https://sockets.streamlabs.com?token=${socketToken}`,
    {
      transports: ["websocket"],
    }
  )

  streamlabsSocket.on("connect_error", (error) => {
    console.log({ error })
  })

  streamlabsSocket.on("disconnect", (reason) => {
    console.log(reason)
  })

  console.log("Connecting to Streamlabs...", socketToken)

  streamlabsSocket.on("connect", () => {
    console.log("CONNECTED to streamlabs")
  })

  // listen to donation events
  streamlabsSocket.on("event", async (eventData) => {
    console.log({ eventData })

    if (eventData.type === "donation") {
      console.log("Donation event")
      const donationEvent: IDonationEvent = eventData.message[0]
      const name = donationEvent.from

      // send to printer
      await io.emit("print", {
        text: `${name} ทิป ${donationEvent.formattedAmount}`,
      })

      await io.emit("print", {
        text: donationEvent.message,
      })
    }
  })
}
