const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API",
      version: "1.0.0",
      description: "Documentation for E-Commerce API",
    },
    servers: [
      {
        url: "http://localhost:5000", // เปลี่ยนตาม URL ที่ใช้
      },
    ],
    components: {
      schemas: {
        Category: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            name: {
              type: "string",
              example: "Electronics",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-11-14T02:23:08.082Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-11-14T02:23:08.082Z",
            },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            title: { type: "string", example: "Gaming Laptop" },
            description: { type: "string", example: "High-end gaming laptop" },
            price: { type: "number", example: 1299.99 },
            quantity: { type: "integer", example: 10 },
            categoryId: { type: "integer", example: 3 },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-11-14T02:23:08.082Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-11-14T02:23:08.082Z",
            },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"], // ระบุโฟลเดอร์ที่เก็บ API Routes
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`📄 Swagger Docs available at http://localhost:500/api-docs`);
};

module.exports = swaggerDocs;
