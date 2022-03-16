const http = require("http")

const host = "localhost"
const port = +process.env.PORT || 3000

const requestListener = function (req, res) {
  res.writeHead(200)
  res.end("OK")
}

const server = http.createServer(requestListener)
server.listen(port, host, () => {
  console.log(`Ping server is running on http://${host}:${port}`)
})
