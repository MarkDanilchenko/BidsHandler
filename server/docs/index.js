const documentation = {
  components: {
    "@schemas": {
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
