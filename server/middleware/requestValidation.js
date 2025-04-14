import { z } from "zod";
import fs from "fs";
import logger from "#server/services/loggerConfig.js";
import { badRequestError } from "#server/utils/errors.js";

/**
 * Returns a middleware that validates the request data with the given Zod schema.
 *
 * It will call the next middleware in the chain if the data is valid.
 * If the data is invalid, it will return a 400 Bad Request response with
 * the error message.
 *
 * If the request contains files, it will delete all of them in case of an error.
 *
 * @param {z.ZodObject} schema The Zod schema to validate the request data with.
 * @returns {Function} The middleware function.
 */
export default function validateRequest(schema) {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
        files: req.files,
      });

      req.body = validatedData.body;
      req.query = validatedData.query;
      req.params = validatedData.params;
      req.files = validatedData.files;

      next();
    } catch (error) {
      if (req.files) {
        Object.values(req.files).forEach((file) => {
          fs.unlink(file[0].path, (error) => {
            if (error) {
              logger.error(error.message);
            }
          });
        });
      }
      if (error instanceof z.ZodError) {
        return badRequestError(res, error.issues[0]);
      }

      return badRequestError(res, error.message);
    }
  };
}
