const { Server } = require("socket.io")

const io = new Server(8888, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

io.on("connection", (socket) => {
  console.log("a client has connected")

  // Relay messages to other clients
  socket.onAny((event, ...args) => {
    console.log(event, ...args)
    socket.broadcast.emit(event, ...args)
  })
})
