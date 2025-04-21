import jwt from "jsonwebtoken";
import fs from "fs";
import crypto from "crypto";
import { Jwt, User } from "#server/models/index.js";
import { badRequestError, notFoundError, unauthorizedError } from "../utils/errors.js";
import logger from "#server/services/loggerConfig.js";

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

  async updateProfile(req, res) {
    /*
    #swagger.tags = ['Users']
    #swagger.summary = 'Update profile end-point.'
    #swagger.description = 'This is the end-point to update user profile.'
    #swagger.operationId = 'updateProfile'
    #swagger.security = [{"bearerAuth": []}]
    #swagger.requestBody = {
      required: true,
      content: {
        "multipart/form-data": {
          schema: {
            $ref: "#/components/schemas/RequestUpdateProfileSchema"
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
      const { username, firstName, lastName, gender, isAdmin } = req.body;
      const avatar = Object.keys(req.files).length ? req.files.avatar[0].path : undefined;

      const { userId } = jwt.decode(accessToken);

      const user = await User.findOne({
        where: { id: userId },
      });
      if (!user) {
        return notFoundError(res, "User not found!");
      }

      const options = {
        username,
        first_name: firstName,
        last_name: lastName,
        gender,
        isAdmin,
        avatar: avatar ? avatar : user.avatar,
      };

      await User.update(options, {
        where: { id: userId },
      });

      if (avatar && user.avatar) {
        fs.unlink(user.avatar, (error) => {
          if (error) {
            logger.error(error.message);
          }
        });
      }

      res.status(200);
      res.end();
    } catch (error) {
      badRequestError(res, error.message);
    }
  }

  async deleteProfile(req, res) {
    /*
    #swagger.tags = ['Users']
    #swagger.summary = 'Delete profile end-point.'
    #swagger.description = 'This is the end-point to delete user profile.'
    #swagger.operationId = 'deleteProfile'
    #swagger.security = [{"bearerAuth": []}]
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

      await User.destroy({
        where: { id: userId },
      });

      await Jwt.destroy({
        where: { userId },
      });

      res.status(200);
      res.end();
    } catch (error) {
      badRequestError(res, error.message);
    }
  }

  async restoreProfile(req, res) {
    /*
    #swagger.tags = ['Users']
    #swagger.summary = 'Restore profile end-point.'
    #swagger.description = 'This is the end-point to restore user profile.'
    #swagger.operationId = 'restoreProfile'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/RequestRestoreProfileSchema"
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
      const { username, email, password } = req.body;
      const options = username ? { username } : { email };

      const user = await User.findOne({
        where: options,
        paranoid: false,
      });
      if (!user) {
        return notFoundError(res, "User not found!");
      }

      const checkPassword = crypto.createHash("sha256").update(password).digest("hex") === user.password;
      if (!checkPassword) {
        return unauthorizedError(res, "Password is not valid!");
      }

      await User.restore({
        where: options,
      });

      res.status(200);
      res.end();
    } catch (error) {
      badRequestError(res, error.message);
    }
  }
}

const userController = new UserController();

export default userController;
