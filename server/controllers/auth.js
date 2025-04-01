import { badRequestError, notFoundError, unauthorizedError } from "../utils/errors.js";
import { Jwt, User } from "../models/index.js";
import { Op } from "sequelize";
import { expressOptions } from "../env.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { expressOptions } from "../env.js";

class AuthController {
  async signup(req, res) {
    /*
		#swagger.tags = ['Reg&Auth']
		#swagger.summary = 'Sign up end-point.'
		#swagger.description = 'This is the end-point to sign up in the system.'
		#swagger.operationId = 'signup'
    #swagger.requestBody = {
      required: true,
      content: {
        "multipart/form-data": {
          schema: {
            $ref: "#/components/schemas/RequestSignUpSchema"
          }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'Created'
    }
    #swagger.responses[400] = {
      description: 'Bad Request',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Response400Schema'
          }
        }
      }
    }
     */
    try {
      const { username, firstName, lastName, email, password, gender, isAdmin } = req.body;
      const avatar = Object.keys(req.files).length ? req.files.avatar[0].path : null;

      const isUserExists = await User.findOne(
        {
          where: {
            [Op.or]: [{ username }, { email }],
          },
        },
        {
          paranoid: false,
        },
      );

      if (isUserExists) {
        return badRequestError(res, "User already exists");
      }

      const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

      await User.create({
        username,
        first_name: firstName,
        last_name: lastName,
        email,
        password: hashedPassword,
        gender,
        isAdmin,
        avatar,
      });

      res.sendStatus(201);
      res.end();
    } catch (error) {
      badRequestError(res, error.message);
    }
  }

  async signin(req, res) {
    /*
    #swagger.tags = ['Reg&Auth']
    #swagger.summary = 'Sign in end-point.'
    #swagger.description = 'This is the end-point to signin in the system.'
    #swagger.operationId = 'signin'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/RequestSignInSchema"
          }
        }
      }
    }
    #swagger.responses[200] = {
      description: 'OK',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/ResponseSuccessfulAuthenticationSchema'
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

      const searchCondition = username ? { username } : { email };
      const user = await User.findOne({
        where: searchCondition,
      });
      if (!user) {
        return notFoundError(res, "User not found!");
      }

      const checkPassword = crypto.createHash("sha256").update(password).digest("hex") === user.password;
      if (!checkPassword) {
        return unauthorizedError(res, "Wrong password!");
      }

      const accessToken = jwt.sign({ userId: user.id }, expressOptions.jwtSecret, {
        expiresIn: expressOptions.jwtAccessExpiresIn,
      });
      const refreshToken = jwt.sign({ userId: user.id }, expressOptions.jwtSecret, {
        expiresIn: expressOptions.jwtRefreshExpiresIn,
      });

      const relatedRefreshToken = await Jwt.findOne({
        where: {
          userId: user.id,
        },
      });

      if (relatedRefreshToken) {
        await Jwt.update(
          {
            refresh_token: refreshToken,
          },
          {
            where: {
              userId: user.id,
            },
          },
        );
      } else {
        await Jwt.create({
          userId: user.id,
          refresh_token: refreshToken,
        });
      }

      res.status(200);
      res.send(JSON.stringify({ accessToken }));
      res.end();
    } catch (error) {
      badRequestError(res, error.message);
    }
  }
}

const authController = new AuthController();

export default authController;
