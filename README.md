# Hamro Service Backend API

Backend API for Hamro Service built with Node.js, Express, TypeScript, and MongoDB.

## Features

- User Authentication (Register, Login)
- JWT Token-based Authentication
- Password Hashing with bcrypt
- Clean Architecture (Controller → Service → Repository)
- Zod Validation
- Error Handling Middleware
- MongoDB Integration

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   - Create a `.env` file in the backend directory
   - Add the following values:
     ```
     PORT=4000
     MONGODB_URI=mongodb+srv://dahalrojit1700:Whatsup!1@cluster0.rkfblb5.mongodb.net/hamro__service_web
     JWT_SECRET=change-me-to-a-secure-secret-key-in-production
     JWT_EXPIRES_IN=1d
     BCRYPT_SALT_ROUNDS=10
     FRONTEND_URL=http://localhost:3000
     ```
   - **Note**: The MongoDB connection string is already configured with your Atlas cluster and database name `hamro__service_web`

3. **Start MongoDB**
   - Make sure MongoDB is running on your system
   - Or update `MONGODB_URI` to your MongoDB connection string

4. **Run Development Server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:4000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Forgot password (placeholder)

### Health Check

- `GET /health` - Server health check

## Project Structure

```
src/
  ├── config/          # Configuration files
  ├── controllers/     # Request handlers
  ├── database/        # Database connection
  ├── dtos/           # Data Transfer Objects (Zod schemas)
  ├── errors/         # Custom error classes
  ├── middleware/     # Express middleware
  ├── models/         # Mongoose models
  ├── repositories/   # Data access layer
  ├── routes/         # Route definitions
  ├── services/       # Business logic
  └── types/          # TypeScript types
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Testing

Use the Postman collection in `/postman/hamro_service_auth.postman_collection.json` to test the API endpoints.

## License

ISC

