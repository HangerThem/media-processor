import { Request, Response, NextFunction } from "express"

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.headers.authorization?.replace("Bearer ", "")
  if (!token || token !== process.env.QUEUE_SECRET) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  next()
}
