// --------------------------------------GENERATE DOCUMENTATION
const documentation = {
  components: {
    securitySchemes: {
      bearerAuth_schema: {
        type: "http",
        scheme: "bearer",
        // bearerFormat: 'JWT',
      },
    },
    "@schemas": {
      Error401_responseSchema: {
        type: "object",
        required: ["message"],
        properties: {
          message: {
            type: "string",
            format: "string",
            example: "Unauthorized. User is not authorized.",
            description: "Error message to the unauthorized user.",
          },
        },
      },
      Error403_responseSchema: {
        type: "object",
        required: ["message"],
        properties: {
          message: {
            type: "string",
            format: "string",
            example: "Forbidden",
            description: "Error message of the forbidden request.",
          },
        },
      },
      Error404_responseSchema: {
        type: "object",
        required: ["message"],
        properties: {
          message: {
            type: "string",
            format: "string",
            example: "Not found",
            description: "Error message of the not found request.",
          },
        },
      },
      Error413_responseSchema: {
        type: "object",
        required: ["message"],
        properties: {
          message: {
            type: "string",
            format: "string",
            example: "File size is too big. Should be less than 10 MB.",
            description: "Error message of the too large payload.",
          },
        },
      },
      Error415_responseSchema: {
        type: "object",
        required: ["message"],
        properties: {
          message: {
            type: "string",
            format: "string",
            example: "Incorrect file format. For the avatar only .png, .jpg and .jpeg formats are allowed!",
            description: "Error message of the unsupported media type.",
          },
        },
      },
      Error422_responseSchema: {
        type: "object",
        required: ["message"],
        properties: {
          message: {
            type: "string",
            format: "string",
            example: "Unprocessable Entity",
            description: "Error message of the unprocessable entity.",
          },
        },
      },
      Error500_responseSchema: {
        type: "object",
        required: ["message"],
        properties: {
          message: {
            type: "string",
            format: "string",
            example: "Internal server error",
            description: "Error message of the internal server error.",
          },
        },
      },
      UserProfile_responseSchema: {
        type: "object",
        required: ["username", "email", "first_name", "last_name", "avatar", "created_at", "role"],
        properties: {
          username: {
            type: "string",
            format: "string",
            example: "Ronald10",
            description: "Username in the system",
          },
          email: {
            type: "string",
            format: "string",
            example: "ronald123@example.com",
            description: "Users email",
          },
          first_name: {
            type: "string",
            format: "string",
            example: "Ronald",
            description: "Users First name",
          },
          last_name: {
            type: "string",
            format: "string",
            example: "Doe",
            description: "Users Last name",
          },
          avatar: {
            type: "string",
            format: "string",
            example: "/avatar.png",
            description: "Users avatar",
          },
          created_at: {
            type: "string",
            format: "date-time",
            example: "2021-01-01T00:00:00.000Z",
            description: "Users creation date",
          },
          role: {
            type: "string",
            format: "string",
            example: "user",
            description: "Users role",
            enum: ["user", "admin"],
          },
        },
      },
      SignInWithEmail_requestSchema: {
        type: "object",
        required: ["password", "email"],
        properties: {
          password: {
            type: "string",
            format: "string",
            example: "ronald123",
            description: "Users password.",
          },
          email: {
            type: "string",
            format: "string",
            example: "ronald123@example.com",
            description: "Users email.",
          },
          username: {
            type: "string",
            format: "string",
            example: "ronald10",
            description: "Users username.",
          },
        },
      },
      SignInWithUsername_requestSchema: {
        type: "object",
        required: ["password", "username"],
        properties: {
          password: {
            type: "string",
            format: "string",
            example: "ronald123",
            description: "Users password.",
          },
          username: {
            type: "string",
            format: "string",
            example: "ronald10",
            description: "Users username.",
          },
          email: {
            type: "string",
            format: "string",
            example: "ronald123@example.com",
            description: "Users email.",
          },
        },
      },
      SignUp_requestSchema: {
        type: "object",
        required: ["username", "email", "password"],
        properties: {
          username: {
            type: "string",
            format: "string",
            example: "ronald10",
            description: "Users username",
          },
          email: {
            type: "string",
            format: "string",
            example: "ronald123@example.com",
            description: "Users email",
          },
          password: {
            type: "string",
            format: "string",
            example: "ronald123",
            description: "Users password",
          },
          first_name: {
            type: "string",
            format: "string",
            example: "Ronald",
            description: "Users First name",
          },
          last_name: {
            type: "string",
            format: "string",
            example: "Doe",
            description: "Users Last name",
          },
          role: {
            type: "string",
            format: "string",
            example: "user",
            description: "Users role",
            enum: ["admin", "user"],
          },
          avatar: {
            type: "string",
            format: "binary",
            description: "Users avatar",
          },
        },
      },
      Request_schema: {
        type: "object",
        required: ["id", "status", "message", "comment", "created_at", "updated_at", "created_by", "resolved_by"],
        properties: {
          id: {
            type: "integer",
            format: "integer",
            example: 1,
            description: "Request id",
          },
          status: {
            type: "string",
            format: "string",
            example: "active",
            description: "Request status",
            enum: ["active", "resolved"],
          },
          message: {
            type: "string",
            format: "string",
            example: "Ipsam quasi, est esse, saepe incidunt adipisci nam hic velit laudantium itaque nisi!",
            description: "Request message",
          },
          comment: {
            type: "string",
            format: "string",
            example: "Ipsam quasi, est esse, saepe incidunt adipisci nam hic velit laudantium itaque nisi!",
            description: "Admins comment to the resolved request",
          },
          created_at: {
            type: "string",
            format: "date-time",
            example: "2022-01-01T00:00:00.000Z",
            description: "Request creation date",
          },
          updated_at: {
            type: "string",
            format: "date-time",
            example: "2022-01-01T00:00:00.000Z",
            description: "Request update date",
          },
          created_by: {
            type: "integer",
            format: "integer",
            example: 1,
            description: "Request creator id",
          },
          resolved_by: {
            type: "integer",
            format: "integer",
            example: 1,
            description: "Request resolver id",
          },
        },
      },
      PageInfo_schema: {
        type: "object",
        required: ["currentPage", "itemsPerPage", "totalItems", "totalPages", "nextPage", "previousPage"],
        properties: {
          currentPage: {
            type: "integer",
            format: "integer",
            example: 1,
            description: "Current page",
          },
          itemsPerPage: {
            type: "integer",
            format: "integer",
            example: 10,
            description: "Limit of items per page",
          },
          totalItems: {
            type: "integer",
            format: "integer",
            example: 100,
            description: "Total items count",
          },
          totalPages: {
            type: "integer",
            format: "integer",
            example: 10,
            description: "Total pages count",
          },
          nextPage: {
            type: "integer",
            format: "integer",
            example: 2,
            description: "Next page number",
          },
          previousPage: {
            type: "integer",
            format: "integer",
            example: 0,
            description: "Previous page number",
          },
        },
      },
      Requests_responseSchema: {
        type: "object",
        required: ["data", "pageInfo"],
        properties: {
          data: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Request_schema",
            },
          },
          pageInfo: {
            $ref: "#/components/schemas/PageInfo_schema",
          },
        },
      },
    },
    parameters: {
      IDInPath: {
        in: "path",
        name: "id",
        description: "Request id",
        required: true,
        schema: {
          type: "integer",
          format: "integer",
          example: 1,
        },
      },
      PageInQuery: {
        in: "query",
        name: "page",
        description: "Page number",
        required: false,
        schema: {
          type: "integer",
          format: "integer",
          example: 1,
        },
      },
      LimitInQuery: {
        in: "query",
        name: "limit",
        description: "Limit of items per page",
        required: false,
        schema: {
          type: "integer",
          format: "integer",
          example: 10,
        },
      },
    },
  },
};
