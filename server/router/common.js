import express from "express";
import { expressOptions } from "../env.js";

const router = express.Router();

router.get("/", async (req, res) => {
  res.status(200);
  res.setHeader("Content-Type", "text/html");
  res.render("startPage/main.html", { host: expressOptions.host, port: expressOptions.port });
});

export default router;
