router.route("/").get(async (req, res) => {
  // #swagger.tags = ['Greeting']
  // #swagger.summary = 'Greeting HTML-page end-point.'
  // #swagger.description = 'This is a base greeting HTML-page of the API, where you can learn more about it purpose and get links to the documentation and source code on GitHub.com.'
  // #swagger.operationId = 'greeting'
  /*
	#swagger.responses[200] = {
		description: 'OK',
		content: {
			"text/html":{
				schema: {
					type: 'string',
					format: 'html',
					example: '<!DOCTYPE html>\n<html lang="en">\n<head>\n\t<meta charset="UTF-8">\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t<title>Document</title>\n</head>\n<body>\n\t<h1>Hello, world!</h1>\n</body>\n</html>',
					description: 'Greeting HTML-page.',
				}
			}
		}
	}
	*/
});

// http://127.0.0.1:3000/api/v1/signup - SIGNUP_ROUTE
router.route("/signup").post(
  multer_config.any(),
  [
    body("username", "Required. Should only contain letters, numbers, underscores, dots and dashes.")
      .exists()
      .custom((value) => {
        return value.match(/^[a-zA-Z0-9_\.\-]+$/g);
      }),
    body("email", "Required. Should be a valid email address.").exists().isEmail(),
    body(
      "first_name",
      "Optional. The first name can only contain letters and must be at least 2 characters long.",
    ).custom((value) => {
      if (value) {
        return value.match(/^[a-zA-Z]{2,}$/g);
      } else {
        return true;
      }
    }),
    body(
      "last_name",
      "Optional. The last name can only contain letters and must be at least 2 characters long.",
    ).custom((value) => {
      if (value) {
        return value.match(/^[a-zA-Z]{2,}$/g);
      } else {
        return true;
      }
    }),
    body("password", "Password must be at least 8 characters and contain at least one number and one letter!").custom(
      (value) => {
        return value.match(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/gi);
      },
    ),
    body("role", 'Optional. Allowed roles: "user" and "admin".').custom((value) => {
      if (value) {
        return value === "user" || value === "admin";
      } else {
        return true;
      }
    }),
  ],
  routesDataValidation,
  AuthController.signup,
);

// http://127.0.0.1:3000/api/v1/signin - SIGNIN_ROUTE
router
  .route("/signin")
  .post([body("password", "Password is required.").exists()], routesDataValidation, AuthController.signin);

// http://127.0.0.1:3000/api/v1/signout - SIGNOUT_ROUTE
router
  .route("/signout")
  .get(
    [header("Authorization", "Bearer refresh token should be provided!").exists()],
    routesDataValidation,
    verifyToken,
    AuthController.signout,
  );

// http://127.0.0.1:3000/api/v1/refresh - REFRESH_ROUTE
router
  .route("/refresh")
  .get(
    [header("Authorization", "Bearer refresh token should be provided!").exists()],
    routesDataValidation,
    verifyToken,
    AuthController.refresh,
  );

// http://127.0.0.1:3000/api/v1/profile - PROFILE_ROUTE
router
  .route("/profile")
  .get(
    [header("Authorization", "Bearer access token should be provided!").exists()],
    routesDataValidation,
    verifyToken,
    AuthController.profile,
  );

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

// http://127.0.0.1:3000/api/v1/* - NOT_FOUND
router.route("*").get(async (req, res) => {
  res.status(404);
  res.json({
    message: "Resource Not found. Please, check the URL and try again.",
  });
  res.end();
});
