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
