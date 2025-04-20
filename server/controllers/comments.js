import { badRequestError, notFoundError } from "../utils/errors.js";
import { Comment, User, Bid } from "../models/index.js";
import jwt from "jsonwebtoken";

class CommentsController {
  async createComment(req, res) {
    /*
     #swagger.tags = ['Bids&Comments']
     #swagger.summary = 'Create comment end-point.'
     #swagger.description = 'This is the end-point to create comment.'
     #swagger.operationId = 'createComment'
     #swagger.security = [{"bearerAuth": []}]
     #swagger.parameters['$ref'] = ['#/components/parameters/IdInPath']
     #swagger.requestBody = {
       required: true,
       content: {
         'application/json': {
           schema: {
             $ref: '#/components/schemas/RequestCreateBidCommentSchema'
           }
         }
       }
     },
     #swagger.responses[201] = {
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
     },
     #swagger.responses[404] = {
       description: 'Not Found',
       content: {
         'application/json': {
           schema: {
             $ref: '#/components/schemas/Response404Schema'
           }
         }
       }
     },
     */
    try {
      const accessToken = req.headers.authorization.split(" ")[1];
      const { userId: authorId } = jwt.decode(accessToken);
      const { id: bidId } = req.params;
      const { message } = req.body;

      const user = await User.findOne({ where: { id: authorId } });
      if (!user) {
        return notFoundError(res, "User not found!");
      }

      const bid = await Bid.findOne({ where: { id: bidId } });
      if (!bid) {
        return notFoundError(res, "Bid not found!");
      }

      await Comment.create({
        message,
        authorId,
        bidId,
      });

      res.status(201);
      res.end();
    } catch (error) {
      badRequestError(res, error.message);
    }
  }

  async getComments(req, res) {
    /*
     #swagger.tags = ['Bids&Comments']
     #swagger.summary = 'Get bids comments end-point.'
     #swagger.description = 'This is the end-point to get comments of a single bid.'
     #swagger.operationId = 'getComments'
     #swagger.security = [{"bearerAuth": []}]
     #swagger.parameters['$ref'] = ['#/components/parameters/LimitInQuery', '#/components/parameters/OffsetInQuery', '#/components/parameters/IdInPath']
     #swagger.responses[200] = {
       description: 'OK',
       content: {
         'application/json': {
           schema: {
             $ref: '#/components/schemas/ResponseGetCommentsSchema'
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
     },
     #swagger.responses[404] = {
       description: 'Not Found',
       content: {
         'application/json': {
           schema: {
             $ref: '#/components/schemas/Response404Schema'
           }
         }
       }
     }
     */
    try {
      const { limit, offset } = req.query;
      const { id: bidId } = req.params;

      const { rows: comments, count } = await Comment.findAndCountAll({
        where: { bidId },
        limit,
        offset,
      });

      if (!comments.length) {
        return notFoundError(res, "Comments not found!");
      }

      res.status(200);
      res.send({ comments, count, limit, offset });
      res.end();
    } catch (error) {
      badRequestError(res, error.message);
    }
  }

  async editComment(req, res) {
    /*
     #swagger.tags = ['Bids&Comments']
     #swagger.summary = 'Edit comment end-point.'
     #swagger.description = 'This is the end-point to edit comment.'
     #swagger.operationId = 'editComment'
     #swagger.security = [{"bearerAuth": []}]
     #swagger.parameters['$ref'] = ['#/components/parameters/IdInPath', '#/components/parameters/CommentIdInPath']
     #swagger.requestBody = {
       required: true,
       content: {
         'application/json': {
           schema: {
             $ref: '#/components/schemas/RequestEditBidCommentSchema'
           }
         }
       }
     }
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
     },
     #swagger.responses[404] = {
       description: 'Not Found',
       content: {
         'application/json': {
           schema: {
             $ref: '#/components/schemas/Response404Schema'
           }
         }
       }
     }
     */
    try {
      const accessToken = req.headers.authorization.split(" ")[1];
      const { userId: authorId } = jwt.decode(accessToken);
      const { id: bidId, commentId } = req.params;
      const { message } = req.body;

      const user = await User.findOne({ where: { id: authorId } });
      if (!user) {
        return notFoundError(res, "User not found!");
      }

      const bid = await Bid.findOne({ where: { id: bidId } });
      if (!bid) {
        return notFoundError(res, "Bid not found!");
      }

      const comment = await Comment.findOne({ where: { id: commentId } });
      if (!comment) {
        return notFoundError(res, "Comment not found!");
      }

      await Comment.update({ message }, { where: { id: commentId, authorId, bidId } });

      res.status(200);
      res.end();
    } catch (error) {
      badRequestError(res, error.message);
    }
  }

  async deleteComment(req, res) {
    /*
     #swagger.tags = ['Bids&Comments']
     #swagger.summary = 'Delete comment end-point.'
     #swagger.description = 'This is the end-point to delete comment.'
     #swagger.operationId = 'deleteComment'
     #swagger.security = [{"bearerAuth": []}]
     #swagger.parameters['$ref'] = ['#/components/parameters/IdInPath', '#/components/parameters/CommentIdInPath']
     #swagger.responses[204] = {
       description: 'No Content',
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
     },
     #swagger.responses[404] = {
       description: 'Not Found',
       content: {
         'application/json': {
           schema: {
             $ref: '#/components/schemas/Response404Schema'
           }
         }
       }
     }
    */
    try {
      const accessToken = req.headers.authorization.split(" ")[1];
      const { userId: authorId } = jwt.decode(accessToken);
      const { id: bidId, commentId } = req.params;

      const user = await User.findOne({ where: { id: authorId } });
      if (!user) {
        return notFoundError(res, "User not found!");
      }

      const bid = await Bid.findOne({ where: { id: bidId } });
      if (!bid) {
        return notFoundError(res, "Bid not found!");
      }

      const comment = await Comment.findOne({ where: { id: commentId } });
      if (!comment) {
        return notFoundError(res, "Comment not found!");
      }

      await Comment.destroy({ where: { id: commentId, authorId, bidId } });

      res.status(204);
      res.end();
    } catch (error) {
      badRequestError(res, error.message);
    }
  }
}

const commentsController = new CommentsController();

export default commentsController;
