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
import commonRouter from "./router/common.js";
import { fileURLToPath } from "url";

const server = express();
const absolutePath = path.dirname(fileURLToPath(import.meta.url));

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
  views: absolutePath + "/views",
});
server.set("view engine", "html");

server.use(cors({ origin: "*" }));
server.use(cookieParser(expressOptions.cookieSecret));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use("/static", express.static(path.join(absolutePath, "/assets")));
server.use("/uploads", express.static(path.join(absolutePath, "/uploads")));

const swaggerDocs = fs.readFileSync("./docs/swagger-output.json", "utf-8");
const swaggerUIOptions = {
  explorer: true,
  swaggerOptions: {
    url: "/api/v1/docs/swagger-output.json",
  },
};
server.get("/api/v1/docs/swagger-output.json", (req, res) => {
  /*
  #swagger.ignore = true
  */
  res.status(200);
  res.json(JSON.parse(swaggerDocs));
  res.end();
});
server.use("/api/v1/docs", swaggerUI.serveFiles(null, swaggerUIOptions), swaggerUI.setup(null, swaggerUIOptions));

server.all("/", (req, res) => {
  /*
  #swagger.ignore = true
  */
  res.status(302).redirect("/api/v1/");
});

server.use("/api/v1/auth", authRouter);
server.use("/api/v1/user", userRouter);
server.use("/api/v1/bids", bidsRouter);
server.use("/api/v1", commonRouter);

server.get("/test", (req, res) => {
  /*
  #swagger.ignore = true
  */
  res.status(200);
  res.send(JSON.stringify({ message: "test" }));
  res.end();
});

server.all("*", (req, res) => {
  /*
  #swagger.ignore = true
  */
  res.status(404);
  res.send(JSON.stringify({ message: "Resource is not Found" }));
  res.end();
});

export default server;
