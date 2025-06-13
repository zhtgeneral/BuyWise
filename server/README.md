# BuyWise Backend

A Node.js/Express backend for the BuyWise application, providing smart shopping recommendations and price tracking features.

## Features

- JWT Authentication
- MongoDB Database Integration
- RESTful API Endpoints
- CORS Enabled
- TypeScript Support

## Prerequisites

- Node.js (v20 or higher)
- MongoDB Atlas Account
- npm or yarn

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
FRONTEND_URL=http://localhost:3000
```

Note: Replace `<username>`, `<password>`, `<cluster>`, and `<database>` with your MongoDB Atlas credentials. Make sure to URL-encode any special characters in your password (e.g., `@` becomes `%40`).

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd buywise-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Public Routes
- `GET /api/auth/hello` - Test endpoint

### Protected Routes (Requires JWT)
- `GET /api/protected` - Example protected route

## Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
src/
├── index.ts          # Main application file
├── lib/             # Utility functions and configurations
├── models/          # MongoDB models
├── routes/          # API routes
└── middleware/      # Custom middleware
```

## Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS enabled
- Environment variables for sensitive data

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
