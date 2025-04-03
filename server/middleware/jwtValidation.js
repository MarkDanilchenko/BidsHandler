import jwt from "jsonwebtoken";
import { unauthorizedError } from "#server/utils/errors.js";
import { expressOptions } from "#server/env.js";

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
