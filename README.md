# Book Review Platform 📚

A modern full-stack web application for discovering, reviewing, and managing books. Built with React, Node.js, and MongoDB, featuring a responsive design and comprehensive admin dashboard.

## 🌟 Key Features

### 🔐 Authentication & Authorization
- JWT-based authentication with secure refresh tokens
- Role-based access control (User vs Admin)
- Protected routes and API endpoints
- Secure HTTP-only cookie management

### 📖 Book Management (Admin)
- CRUD operations for book catalog
- Cloudinary integration for cover image uploads
- Rich book metadata (title, author, description, genres)
- Bulk book management via admin dashboard

### ⭐ Review System
- Star-based rating system (1-5 stars)
- Detailed written reviews with comments
- One review per book per user policy
- Average rating calculation and display
- Edit/delete own reviews

### 👤 User Profiles
- Public user profiles with reading statistics
- Profile photo and bio management
- Review history and reading activity
- User-specific book collections

### 🎨 Modern UI/UX
- Responsive design for all screen sizes
- Built with TailwindCSS and shadcn/ui components
- Dark/light theme support
- Smooth animations and transitions
- Mobile-first approach

### 🔍 Discovery Features
- Advanced search and filtering by genre
- Pagination for large collections
- Book recommendations
- Featured book sections

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with concurrent features
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **Radix UI** - Headless UI primitives
- **Lucide React** - Icon library
- **Axios** - HTTP client with interceptors

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Cloudinary** - Image upload and management
- **Multer** - File upload middleware

### DevOps & Tools
- **ESLint** - Code linting
- **Nodemon** - Development auto-restart
- **Cookie Parser** - HTTP cookie parsing
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
bookReview/
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── api/               # API service layers
│   │   │   ├── authService.js
│   │   │   ├── booksService.js
│   │   │   ├── reviewsService.js
│   │   │   └── usersService.js
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── forms/        # Form components
│   │   │   ├── book/         # Book-related components
│   │   │   └── profile/      # Profile components
│   │   ├── context/          # React context providers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   ├── routes/           # Route protection & configuration
│   │   └── utils/            # Utility functions
│   ├── public/               # Static assets
│   └── package.json
└── server/                    # Backend Node.js application
    ├── src/
    │   ├── controllers/      # Route handlers
    │   ├── middleware/       # Express middleware
    │   ├── models/          # MongoDB models
    │   ├── routes/          # API route definitions
    │   ├── utils/           # Utility functions
    │   └── config/          # Configuration files
    ├── API_DOC.md           # API documentation
    └── package.json
```

## 🔧 Environment Variables

### Client (.env)
```env
VITE_API_URL=http://localhost:5000
```

### Server (.env)
```env
# Database
MONGO_URI=mongodb://localhost:27017/bookreview

# JWT Secrets
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration (for production)
CLIENT_URL=https://your-frontend-domain.com
```

**Note:** `CLIENT_URL` is automatically added to CORS allowed origins when specified. This is essential for production deployments where your frontend is hosted on a different domain.

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5.0 or higher)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bookReview
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**
   - Create `.env` files in both `client/` and `server/` directories
   - Update the variables with your actual values (see examples below)
   - See [Environment Variables](#environment-variables) section above

5. **Set up Cloudinary** (Required for image uploads)
   - Create a free account at [Cloudinary](https://cloudinary.com/)
   - Copy your cloud name, API key, and API secret to the server `.env` file
   - See `server/CLOUDINARY_SETUP.md` for detailed instructions

### Development

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   The API will be available at `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd client
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

3. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`
   - API Documentation: See `server/API_DOC.md`

### Build for Production

1. **Build the frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Start the backend in production**
   ```bash
   cd server
   npm start
   ```

## 🚀 Deployment Guide

### Frontend (Netlify/Vercel)
1. Build the client application
2. Deploy the `client/dist` folder
3. Configure environment variables in your hosting platform
4. Set up redirects for React Router

### Backend (Railway/Heroku/DigitalOcean)
1. Set up MongoDB Atlas or a managed MongoDB instance
2. Configure all environment variables
3. Deploy the `server` directory
4. Ensure the PORT environment variable is set correctly

### Environment Variables for Production
- Update `VITE_API_URL` to your production API URL
- Set `NODE_ENV=production` for the backend
- Use strong, unique JWT secrets
- Configure CORS for your production domains

## 📖 API Documentation

Comprehensive API documentation is available at `server/API_DOC.md`, including:

- Authentication endpoints
- Book management APIs
- Review system endpoints
- User profile management
- Error handling and response formats

[📖 View Full API Documentation](./server/API_DOC.md)

## 🖼️ Screenshots

<!-- Add screenshots here when available -->
*Screenshots will be added to showcase the application interface*

### Key Pages
- 🏠 **Homepage** - Featured books and navigation
- 📚 **Books Page** - Search, filter, and browse books
- 📖 **Book Details** - Reviews, ratings, and book information
- 👤 **User Profile** - Reading activity and reviews
- ⚙️ **Admin Dashboard** - Book and review management

## 🧪 Demo Credentials

For testing the admin functionality:

**Admin Account:**
- Email: `admin@bookplatform.com`
- Password: `admin123`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [API Documentation](./server/API_DOC.md)
2. Review the [Cloudinary Setup Guide](./server/CLOUDINARY_SETUP.md)
3. Open an issue on GitHub
4. Contact: [AbhishekRajoria24@gmail.com](mailto:AbhishekRajoria24@gmail.com)

## 🔗 Links

- **Portfolio**: [https://abhishek-rajoria.vercel.app/](https://abhishek-rajoria.vercel.app/)
- **GitHub**: [https://github.com/Abhishek1334](https://github.com/Abhishek1334)

---

Built with ❤️ by [Abhishek Rajoria](https://github.com/Abhishek1334)
