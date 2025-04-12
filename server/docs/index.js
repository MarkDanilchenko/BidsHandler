const documentation = {
  components: {
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
