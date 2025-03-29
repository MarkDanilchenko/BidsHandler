import { badRequestError } from "../utils/errors.js";
import { User } from "../models/index.js";
import { Op } from "sequelize";
import crypto from "crypto";

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
}

const authController = new AuthController();

export default authController;
