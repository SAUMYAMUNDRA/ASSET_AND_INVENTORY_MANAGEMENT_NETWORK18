import express from "express";
const cron_router = express.Router();

// Route: GET /api/cron/send-email
cron_router.get("/send-email", (req, res) => {
  console.log("📩 Send email route triggered!");
  res.json({ message: "Send email endpoint hit" });
});

export default cron_router;