import express from "express";
import { expressOptions } from "../env.js";

const router = express.Router();

router.get("/", async (req, res) => {
  /*
  #swagger.tags = ['Greeting']
  #swagger.summary = 'Greeting HTML-page end-point.'
  #swagger.description = 'This is a base greeting HTML-page of the API.'
  #swagger.operationId = 'greeting'
  #swagger.responses[200] = {
    description: 'OK',
    content: {
      'text/html': {
        schema: {
          type: 'string',
          format: 'html',
          description: 'Greeting HTML-page.',
        }
      }
    }
  }
  */
  res.status(200);
  res.render("startPage/main.html", { host: expressOptions.host, port: expressOptions.port });
});

export default router;
