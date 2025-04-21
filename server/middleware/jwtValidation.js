import jwt from "jsonwebtoken";
import { unauthorizedError } from "#server/utils/errors.js";
import { expressOptions } from "#server/env.js";

/**
 * Validate JWT token from Authorization header.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 *
 * @throws {Error} If the token is not found or is not valid.
 * @return {void}
 */
export default function validateJwt(req, res, next) {
  const accessToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!accessToken) {
    return unauthorizedError(res, "Access token not found!");
  }

  jwt.verify(accessToken, expressOptions.jwtSecret, (error) => {
    if (error) {
      return unauthorizedError(res, "Access token is not valid!");
    }

    next();
  });
}
