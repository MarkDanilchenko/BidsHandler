const documentation = {
  components: {
    "@schemas": {
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
