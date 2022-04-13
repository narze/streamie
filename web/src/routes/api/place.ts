import { createClient } from "redis"

export async function get({ url }) {
  const redisUrl = "redis://redis.streamie.homelab.narze.live:56379"
  const redisClient = createClient({
    url: redisUrl,
  })

  const rows = +(url.searchParams.get("rows") ?? 32)

  redisClient.on("error", (err) => console.log("Redis Client Error", err))

  await redisClient.connect().catch(console.error)

  const data = await Promise.all(
    Array(rows)
      .fill(0)
      .map(async (_, idx) => {
        return redisClient.hGetAll(`place:row:${idx + 1}`)
      })
  )

  const dataArray = []

  data.forEach((rowData, idx) => {
    Object.keys(rowData).forEach((x) => {
      dataArray.push([x, idx + 1, rowData[x]])
    })
  })

  await redisClient.disconnect()

  if (data) {
    return {
      body: { data: dataArray },
    }
  }

  return {
    status: 400,
  }
}
