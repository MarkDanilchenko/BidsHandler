import jwt from "jsonwebtoken";
import { Bid } from "../models/index.js";
import { badRequestError } from "../utils/errors.js";

class BidsController {
  async createBid(req, res) {
    /*
    #swagger.tags = ['Bids&Comments']
    #swagger.summary = 'Create bid end-point.'
    #swagger.description = 'This is the end-point to create bid.'
    #swagger.operationId = 'createBid'
    #swagger.security = [{"bearerAuth": []}]
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/RequestCreateBidSchema"
          }
        }
      }
    },
    #swagger.responses[200] = {
      description: 'OK',
    },
    #swagger.responses[400] = {
      description: 'Bad Request',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Response400Schema'
          }
        }
      }
    },
    #swagger.responses[401] = {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Response401Schema'
          }
        }
      }
    }
    */
    try {
      const accessToken = req.headers.authorization.split(" ")[1];
      const { userId } = jwt.decode(accessToken);
      const { message } = req.body;

      const options = {
        message,
        authorId: userId,
      };

      await Bid.create(options);

      res.status(200);
      res.end();
    } catch (error) {
      badRequestError(res, error.message);
    }
  }

  async getBids(req, res) {
    /*
    #swagger.tags = ['Bids&Comments']
    #swagger.summary = 'Get bids end-point.'
    #swagger.description = 'This is the end-point to get bids.'
    #swagger.operationId = 'getBids'
    #swagger.security = [{"bearerAuth": []}]
    #swagger.parameters['$ref'] = ['#/components/parameters/LimitInQuery', '#/components/parameters/OffsetInQuery']
    #swagger.responses[200] = {
      description: 'OK',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/ResponseGetBidsSchema'
          }
        }
      }
    },
    #swagger.responses[400] = {
      description: 'Bad Request',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Response400Schema'
          }
        }
      }
    },
    #swagger.responses[401] = {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Response401Schema'
          }
        }
      }
    }
    */
    try {
      const { limit, offset } = req.query;

      const { rows: bids, count } = await Bid.findAndCountAll({
        offset,
        limit,
      });

      res.status(200);
      res.send(
        JSON.stringify({
          bids,
          count,
          limit: parseInt(limit),
          offset: parseInt(offset),
        }),
      );
      res.end();
    } catch (error) {
      badRequestError(res, error.message);
    }
  }

  async getOneBid(req, res) {}

  async processBid(req, res) {}
}

const bidsController = new BidsController();

export default bidsController;
