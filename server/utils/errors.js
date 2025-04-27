/**
 * Sends a 400 Bad Request response with a JSON body containing a message.
 *
 * @param {http.ServerResponse} res - The response object.
 * @param {string} [message] - The message to be sent in the response body.
 * Defaults to "Bad request!".
 */
function badRequestError(res, message) {
  res.status(400);
  res.send(message ? JSON.stringify({ message }) : { message: "Bad request!" });
  res.end();
}

/**
 * Sends a 404 Not Found response with a JSON body containing a message.
 *
 * @param {http.ServerResponse} res - The response object.
 * @param {string} [message] - The message to be sent in the response body.
 * Defaults to "Not found!".
 */
function notFoundError(res, message) {
  res.status(404);
  res.send(message ? JSON.stringify({ message }) : { message: "Not found!" });
  res.end();
}

/**
 * Sends a 401 Unauthorized response with a JSON body containing a message.
 *
 * @param {http.ServerResponse} res - The response object.
 * @param {string} [message] - The message to be sent in the response body.
 * Defaults to "Unauthorized!".
 */
function unauthorizedError(res, message) {
  res.status(401);
  res.send(message ? JSON.stringify({ message }) : { message: "Unauthorized!" });
  res.end();
}

export { badRequestError, notFoundError, unauthorizedError };
