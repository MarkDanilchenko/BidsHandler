import jwt from "jsonwebtoken";
import { User } from "#server/models/index.js";
import { badRequestError, notFoundError } from "../utils/errors.js";

class UserController {
  async retrieveProfile(req, res) {
    /*
    #swagger.tags = ['Users']
    #swagger.summary = 'Retrieve profile end-point.'
    #swagger.description = 'This is the end-point to retrieve user profile.'
    #swagger.operationId = 'retrieveProfile'
    #swagger.security = [{"bearerAuth": []}]
    #swagger.responses[200] = {
      description: 'OK',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/ResponseUserProfileSchema'
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

      const { userId } = jwt.decode(accessToken);

      const user = await User.findOne({
        where: { id: userId },
      });
      if (!user) {
        return notFoundError(res, "User not found!");
      }

      user.password = undefined;

      res.status(200);
      res.send(JSON.stringify(user));
      res.end();
    } catch (error) {
      badRequestError(res, error.message);
    }
  }
  async updateProfile(req, res) {}
  async deleteProfile(req, res) {}
  async restoreProfile(req, res) {}
}

const userController = new UserController();

export default userController;
