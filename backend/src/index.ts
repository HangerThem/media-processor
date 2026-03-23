import "dotenv/config"
import express from "express"
import cors from "cors"
import { jobsRouter } from "./routes/jobs"
import { dashboardRouter } from "./routes/dashboard"

const app = express()
const PORT = process.env.PORT || 3001

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true)
      }
      return callback(new Error("Not allowed by CORS"))
    },
    credentials: true,
  }),
)

app.use(express.json())

app.use("/jobs", jobsRouter)
app.use("/dashboard", dashboardRouter)

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: Date.now() })
})

app.listen(PORT, () => {
  console.log(`Media service API listening on port ${PORT}`)
})
