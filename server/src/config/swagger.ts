import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BuyWise API Documentation',
      version: '1.0.0',
      description: 'API documentation for BuyWise application',
      contact: {
        name: 'BuyWise Support',
        email: 'support@buywise.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.ts', './src/api/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options); 