// TODO delete this file
// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import swaggerUi from 'swagger-ui-express';
// import { swaggerSpec } from './config/swagger';
// import profileRoutes from './routes/profile';
// import authRoutes from './routes/auth';
// import productsRoutes from './routes/products';
// import { authMiddleware } from './middleware/auth';
// import { postChat } from './routes/chatbot';

// const cookieParser = require('cookie-parser');
// const test_products = require('../static/products.json');

// dotenv.config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(cookieParser());
// app.use(express.json());

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// app.post('/api/chatbot', postChat);

// app.get('/api/test-products', (req, res) => {
//   return res.json(test_products);
// });

// app.use('/api/profiles', profileRoutes);
// app.use('/api/products', productsRoutes);
// app.use('/api/auth', authRoutes);

// app.get('/api/protected', authMiddleware, (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: 'This is a protected route',
//     data: { user: req.user },
//   });
// });

// // Error handling middleware (fix to accept 4 args to work properly)
// app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
//   console.error(err);
//   res.status(err.statusCode || 500).json({
//     success: false,
//     error: err.message || 'Internal server error',
//   });
// });

// export default app;
