import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  res.status(200);
  res.setHeader("Content-Type", "text/html");
  res.render("startPage/index.html", {});
});

export default router;
