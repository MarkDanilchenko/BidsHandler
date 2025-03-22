import path from "path";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import nunjucks from "nunjucks";
import { expressOptions } from "./env.js";
import swaggerUI from "swagger-ui-express";
import fs from "fs";
import authRouter from "./router/auth.js";
import userRouter from "./router/user.js";
import bidsRouter from "./router/bids.js";

const server = express();

const swaggerDocs = fs.readFileSync("./docs/swagger-output.json", "utf-8");
const swaggerUIOptions = {
  explorer: true,
  swaggerOptions: {
    url: "/api/v1/docs/swagger-output.json",
  },
};

nunjucks.configure("views", {
  autoescape: true,
  express: server,
  tags: {
    blockStart: "{%",
    blockEnd: "%}",
    variableStart: "{{",
    variableEnd: "}}",
    commentStart: "{#",
    commentEnd: "#}",
  },
  views: path.dirname(import.meta.url) + "/views",
});

server.use(cors({ origin: "*" }));
server.use(cookieParser(expressOptions.cookieSecret));
server.use(express.json());
server.use(express.urlencoded({ extended: false }));
server.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

server.use("/uploads", express.static(path.dirname(import.meta.url) + "/uploads"));
// server.use('/api/v1', express.static(`${__dirname}/node_modules`));
// server.use('/api/v1', express.static(`${__dirname}/assets`));

server.get("/api/v1/docs/swagger-output.json", (req, res) => {
  res.status(200);
  res.json(swaggerDocs);
  res.end();
});
server.use("/api/v1/docs", swaggerUI.serveFiles(null, swaggerUIOptions), swaggerUI.setup(null, swaggerUIOptions));

server.all("/", (req, res) => {
  res.status(302).redirect("/api/v1");
});

server.use("/api/v1/auth", authRouter);
server.use("/api/v1/user", userRouter);
server.use("/api/v1/bids", bidsRouter);

server.get("/test", (req, res) => {
  res.status(200);
  res.send(JSON.stringify({ message: "test" }));
  res.end();
});

server.all("*", (req, res) => {
  res.status(404);
  res.send(JSON.stringify({ message: "Resource is not Found" }));
  res.end();
});

export default server;
