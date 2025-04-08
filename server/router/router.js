// http://127.0.0.1:3000/api/v1/requests - POST_A_REQUEST_ROUTE (FOR USER), GET_ALL_REQUESTS_ROUTE (FOR ADMIN)
router
  .route("/requests")
  .get(
    [
      header("Authorization", "Bearer access token should be provided!").exists(),
      body("request_status").exists().isIn(["active", "resolved"]),
    ],
    routesDataValidation,
    verifyToken,
    RequestController.getRequests,
  )
  .post(
    [
      header("Authorization", "Bearer access token should be provided!").exists(),
      body("request_message").exists().isLength({ min: 1, max: 1000 }),
    ],
    routesDataValidation,
    verifyToken,
    RequestController.createRequest,
  );

// http://127.0.0.1:3000/api/v1/requests - PUT_A_REQUEST_ROUTE (FOR ADMIN), DELETE_A_REQUEST_ROUTE (FOR ADMIN)
router
  .route("/requests/:id")
  .put(
    header("Authorization", "Bearer access token should be provided!").exists(),
    param("id").exists().isInt({ min: 1 }),
    routesDataValidation,
    verifyToken,
    RequestController.resolveRequest,
  )
  .delete(
    [
      header("Authorization", "Bearer access token should be provided!").exists(),
      param("id").exists().isInt({ min: 1 }),
    ],
    routesDataValidation,
    verifyToken,
    RequestController.deleteRequest,
  );
