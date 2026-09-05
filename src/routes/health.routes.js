import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/live", (req, res) => {
  res.status(200).json({ status: "up" });
});

router.get("/ready", (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ status: "down" });
  }

  return res.status(200).json({ status: "up" });
});

export default router;
