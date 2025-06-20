# Book Review Platform API Documentation

---

## Table of Contents
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Books](#books)
- [Reviews](#reviews)
- [Users](#users)
- [Error Responses](#error-responses)
- [Security & Authorization](#security--authorization)

---

## Base URL
**Local Development:** `http://localhost:5000`
**Production:** TBD

---

## Authentication

⚠️ **Token-based Route Protection**

All protected routes require a Bearer token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

Refresh tokens are handled via secure HTTP-only cookies and are automatically managed by the client.

### Token Lifecycle
- **Access Token**: Valid for 30 minutes, required for protected routes
- **Refresh Token**: Valid for 7 days, stored in HTTP-only cookie, used to generate new access tokens
- **Auto-refresh**: Client automatically refreshes tokens when they expire

### Register a New User
**POST** `/auth/register`
- **Description:** Register a new user account.
- **Access Level:** Public
- **Content-Type:** `application/json`
- **Request Body:**
  | Field     | Type   | Required | Validation | Description         |
  |-----------|--------|----------|------------|---------------------|
  | name      | string | Yes      | Non-empty  | User's full name    |
  | email     | string | Yes      | Valid email| User's email        |
  | password  | string | Yes      | Min 6 chars| User's password     |

- **Success Response (201):**
  ```json
  {
    "message": "User registered successfully",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
  ```
- **Error Responses:** 
  - 400: Validation failed, Email already registered
  - 500: Server error

---

### Login
**POST** `/auth/login`
- **Description:** Authenticate user and receive tokens.
- **Access Level:** Public
- **Content-Type:** `application/json`
- **Request Body:**
  | Field    | Type   | Required | Validation |
  |----------|--------|----------|------------|
  | email    | string | Yes      | Valid email|
  | password | string | Yes      | Non-empty  |

- **Success Response (200):**
  ```json
  {
    "message": "Login successful",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
  ```
- **Error Responses:** 
  - 400: Validation failed
  - 401: Invalid credentials
  - 500: Server error

---

### Refresh Access Token
**POST** `/auth/refresh`
- **Description:** Get a new access token using the refresh token cookie.
- **Access Level:** Public (uses httpOnly refresh token cookie)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user"
      }
    }
  }
  ```
- **Error Responses:** 
  - 401: Refresh token missing
  - 403: Invalid or expired refresh token
  - 500: Server error

---

### Logout
**POST** `/auth/logout`
- **Description:** Logout and clear the refresh token cookie.
- **Access Level:** Public
- **Success Response (200):**
  ```json
  {
    "message": "Logged out successfully"
  }
  ```
- **Error Responses:** 500: Server error

---

### Get Current User Info
**GET** `/auth/me`
- **Description:** Get the authenticated user's profile information.
- **Access Level:** Authenticated users only
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
  ```
- **Error Responses:** 
  - 401: Unauthorized (invalid/missing token)
  - 404: User not found
  - 500: Server error

---

## Books

### Image Upload Requirements (Cloudinary)
- **Supported formats:** JPEG, JPG, PNG
- **Maximum file size:** 5MB
- **Field name:** `coverImage`
- **Storage:** Cloudinary `/book-covers/` folder
- **Content-Type:** `multipart/form-data` (when uploading files)
- **Auto-optimization:** Quality and format optimization enabled
- **Auto-cleanup:** Old images automatically deleted when updated/removed

**Note:** When sending form data with files, genres should be sent as a JSON string (e.g., `'["Fiction", "Mystery"]'`) or as individual values.

---

### List All Books
**GET** `/api/books`
- **Description:** Retrieve all books with pagination, search, genre filter, and sorting. Includes aggregated review statistics.
- **Access Level:** Public
- **Query Parameters:**
  | Name   | Type   | Default      | Validation | Description                                      |
  |--------|--------|--------------|------------|--------------------------------------------------|
  | page   | number | 1            | >= 1       | Page number                                      |
  | limit  | number | 10           | 1-100      | Results per page (max 100)                      |
  | search | string |              |            | Search in title or author (case-insensitive)    |
  | genre  | string |              |            | Filter by exact genre match                     |
  | sort   | string | -createdAt   | See below  | Sort field (createdAt, title, author with -)    |

**Allowed sort values:** `createdAt`, `-createdAt`, `title`, `-title`, `author`, `-author`

- **Success Response (200):**
  ```json
  {
    "books": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "description": "A classic American novel...",
        "genres": ["Fiction", "Classic"],
        "coverImage": "https://res.cloudinary.com/...",
        "createdBy": {
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z",
        "averageRating": 4.5,
        "reviewCount": 12
      }
    ],
    "totalBooks": 100,
    "totalPages": 10,
    "page": 1,
    "limit": 10
  }
  ```
- **Error Responses:** 500: Server error
- **Examples:**
  - `/api/books?page=2&limit=5`
  - `/api/books?search=gatsby`
  - `/api/books?genre=Fiction`
  - `/api/books?sort=-title`

---

### Get Book Details
**GET** `/api/books/:id`
- **Description:** Retrieve a specific book by ID, including average rating and review count.
- **Access Level:** Public
- **Path Parameters:**
  | Name | Type   | Description  |
  |------|--------|--------------|
  | id   | string | Book ObjectId|

- **Success Response (200):**
  ```json
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "description": "A classic American novel...",
    "genres": ["Fiction", "Classic"],
    "coverImage": "https://res.cloudinary.com/...",
    "createdBy": {
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z",
    "averageRating": 4.5,
    "reviewCount": 12
  }
  ```
- **Error Responses:** 
  - 404: Book not found
  - 500: Server error

---

### Add a New Book
**POST** `/api/books`
- **Description:** Add a new book to the catalog.
- **Access Level:** ✅ Admin users only
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  | Field       | Type         | Required | Description                    |
  |-------------|--------------|----------|--------------------------------|
  | title       | string       | Yes      | Book title                     |
  | author      | string       | Yes      | Book author                    |
  | description | string       | No       | Book description               |
  | genres      | string/array | No       | Book genres (JSON string or array) |
  | coverImage  | file         | No       | Cover image (JPEG/PNG, max 5MB)|

- **Success Response (201):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "New Book",
      "author": "Author Name",
      "description": "Book description",
      "genres": ["Fiction"],
      "coverImage": "https://res.cloudinary.com/...",
      "createdBy": "507f1f77bcf86cd799439012",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  }
  ```
- **Error Responses:** 
  - 400: Title and author are required
  - 401: Unauthorized (missing/invalid token)
  - 403: Admin role required
  - 500: Server error, Failed to upload cover image

---

### Update a Book
**PUT** `/api/books/:id`
- **Description:** Update an existing book.
- **Access Level:** ✅ Admin users only (book creator)
- **Content-Type:** `multipart/form-data` or `application/json`
- **Path Parameters:**
  | Name | Type   | Description  |
  |------|--------|--------------|
  | id   | string | Book ObjectId|

- **Request Body:**
  | Field       | Type         | Required | Description                    |
  |-------------|--------------|----------|--------------------------------|
  | title       | string       | No       | Book title                     |
  | author      | string       | No       | Book author                    |
  | description | string       | No       | Book description               |
  | genres      | string/array | No       | Book genres (JSON string or array) |
  | coverImage  | file         | No       | New cover image (JPEG/PNG, max 5MB)|

- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Updated Book Title",
      "author": "Author Name",
      "description": "Updated description",
      "genres": ["Fiction", "Drama"],
      "coverImage": "https://res.cloudinary.com/...",
      "createdBy": "507f1f77bcf86cd799439012",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T12:00:00.000Z"
    }
  }
  ```
- **Error Responses:** 
  - 401: Unauthorized (missing/invalid token)
  - 403: You are not authorized to update this book
  - 404: Book not found
  - 500: Server error, Failed to upload cover image

---

### Delete a Book
**DELETE** `/api/books/:id`
- **Description:** Delete a book and its associated cover image from Cloudinary.
- **Access Level:** ✅ Admin users only (book creator)
- **Path Parameters:**
  | Name | Type   | Description  |
  |------|--------|--------------|
  | id   | string | Book ObjectId|

- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Book deleted successfully"
  }
  ```
- **Error Responses:** 
  - 401: Unauthorized (missing/invalid token)
  - 403: You are not authorized to delete this book
  - 404: Book not found
  - 500: Server error

---

## Reviews

### List All Reviews
**GET** `/api/reviews`
- **Description:** Get all reviews with pagination and filtering options.
- **Access Level:** Public
- **Query Parameters:**
  | Name   | Type   | Default      | Validation | Description                                                        |
  |--------|--------|--------------|-----------|--------------------------------------------------------------------|
  | page   | number | 1            | >= 1      | Page number                                                        |
  | limit  | number | 10           | 1-100     | Results per page (max 100)                                        |
  | book   | string |              |           | Filter by book ObjectId                                           |
  | user   | string |              |           | Filter by user ObjectId                                           |
  | sort   | string | -createdAt   |           | Sort by field. Prefix with `-` for descending                     |

- **Success Response (200):**
```json
{
  "success": true,
  "reviews": [
    {
        "_id": "507f1f77bcf86cd799439013",
        "user": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "book": {
          "title": "The Great Gatsby",
          "author": "F. Scott Fitzgerald"
        },
      "rating": 5,
        "comment": "Excellent book! Highly recommend.",
        "createdAt": "2024-01-15T14:00:00.000Z",
        "updatedAt": "2024-01-15T14:00:00.000Z"
    }
  ],
  "totalReviews": 100,
  "totalPages": 10,
    "page": 1,
    "limit": 10
}
```
- **Error Responses:** 500: Server error
- **Examples:**
  - `/api/reviews?user=507f1f77bcf86cd799439011&sort=-rating`
  - `/api/reviews?book=507f1f77bcf86cd799439011&page=2`

---

### List Reviews for a Book
**GET** `/api/reviews/:bookId`
- **Description:** Get all reviews for a specific book, sorted by creation date (newest first).
- **Access Level:** Public
- **Path Parameters:**
  | Name   | Type   | Description  |
  |--------|--------|--------------|
  | bookId | string | Book ObjectId|

- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "user": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "book": "507f1f77bcf86cd799439011",
        "rating": 5,
        "comment": "Excellent book! Highly recommend.",
        "createdAt": "2024-01-15T14:00:00.000Z",
        "updatedAt": "2024-01-15T14:00:00.000Z"
      }
    ]
  }
  ```
- **Error Responses:** 
  - 404: Book not found
  - 500: Server error

---

### Add a Review
**POST** `/api/reviews/:bookId`
- **Description:** Add a review for a book (one review per user per book).
- **Access Level:** ✅ Authenticated users only
- **Content-Type:** `application/json`
- **Path Parameters:**
  | Name   | Type   | Description  |
  |--------|--------|--------------|
  | bookId | string | Book ObjectId|

- **Request Body:**
  | Field   | Type   | Required | Validation | Description         |
  |---------|--------|----------|------------|---------------------|
  | rating  | number | Yes      | 1-5        | Star rating         |
  | comment | string | No       |            | Review text         |

- **Success Response (201):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "507f1f77bcf86cd799439013",
      "book": "507f1f77bcf86cd799439011",
      "user": "507f1f77bcf86cd799439012",
      "rating": 5,
      "comment": "Great book!",
      "createdAt": "2024-01-15T14:00:00.000Z",
      "updatedAt": "2024-01-15T14:00:00.000Z"
    }
  }
  ```
- **Error Responses:** 
  - 400: Rating must be between 1 and 5, You have already reviewed this book
  - 401: Unauthorized (missing/invalid token)
  - 404: Book not found
  - 500: Server error

---

### Update a Review
**PUT** `/api/reviews/:reviewId`
- **Description:** Update your own review.
- **Access Level:** ✅ Authenticated users only (review owner)
- **Content-Type:** `application/json`
- **Path Parameters:**
  | Name     | Type   | Description    |
  |----------|--------|----------------|
  | reviewId | string | Review ObjectId|

- **Request Body:**
  | Field   | Type   | Required | Validation | Description         |
  |---------|--------|----------|------------|---------------------|
  | rating  | number | No       | 1-5        | New star rating     |
  | comment | string | No       |            | New review text     |

- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "507f1f77bcf86cd799439013",
      "book": "507f1f77bcf86cd799439011",
      "user": "507f1f77bcf86cd799439012",
      "rating": 4,
      "comment": "Updated comment",
      "createdAt": "2024-01-15T14:00:00.000Z",
      "updatedAt": "2024-01-15T16:00:00.000Z"
    }
  }
  ```
- **Error Responses:** 
  - 400: Rating must be between 1 and 5
  - 401: Unauthorized (missing/invalid token)
  - 403: You are not authorized to update this review
  - 404: Review not found
  - 500: Server error

---

### Delete a Review
**DELETE** `/api/reviews/:reviewId`
- **Description:** Delete your own review.
- **Access Level:** ✅ Authenticated users only (review owner)
- **Path Parameters:**
  | Name     | Type   | Description    |
  |----------|--------|----------------|
  | reviewId | string | Review ObjectId|

- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Review deleted successfully"
  }
  ```
- **Error Responses:** 
  - 401: Unauthorized (missing/invalid token)
  - 403: You are not authorized to delete this review
  - 404: Review not found
  - 500: Server error

---

## Users

### Get User Profile
**GET** `/users/:id`
- **Description:** Retrieve public profile information for a user by ID.
- **Access Level:** Public
- **Path Parameters:**
  | Name | Type   | Description  |
  |------|--------|--------------|
  | id   | string | User ObjectId|

- **Success Response (200):**
  ```json
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
  ```
- **Error Responses:** 
  - 404: User not found
  - 500: Server error

---

### Get User Statistics
**GET** `/users/:id/stats`
- **Description:** Get user's reading statistics including total reviews, average rating given, and review activity.
- **Access Level:** Public
- **Path Parameters:**
  | Name | Type   | Description  |
  |------|--------|--------------|
  | id   | string | User ObjectId|

- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "totalReviews": 15,
      "averageRating": 4.2,
      "recentActivity": [
        {
          "book": {
            "title": "The Great Gatsby",
            "author": "F. Scott Fitzgerald"
          },
          "rating": 5,
          "comment": "Excellent book!",
          "createdAt": "2024-01-15T14:00:00.000Z"
        }
      ]
    }
  }
  ```
- **Error Responses:** 
  - 404: User not found
  - 500: Server error

---

### Update User Profile
**PUT** `/users/:id`
- **Description:** Update your own profile information.
- **Access Level:** ✅ Authenticated users only (profile owner)
- **Content-Type:** `application/json`
- **Path Parameters:**
  | Name | Type   | Description  |
  |------|--------|--------------|
  | id   | string | User ObjectId|

- **Request Body:**
  | Field  | Type   | Required | Validation | Description         |
  |--------|--------|----------|------------|---------------------|
  | name   | string | Yes      | Non-empty  | New display name    |

- **Success Response (200):**
  ```json
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Updated",
    "email": "john@example.com",
    "role": "user"
  }
  ```
- **Error Responses:** 
  - 400: Name is required, Name must be a non-empty string
  - 401: Unauthorized (missing/invalid token)
  - 403: You are not authorized to update this profile
  - 404: User not found
  - 500: Server error

---

## Security & Authorization

### Access Levels
- **Public**: No authentication required
- **Authenticated**: Valid Bearer token required
- **Admin**: Valid Bearer token + admin role required
- **Owner**: Valid Bearer token + resource ownership required

### Role-Based Protection
✅ **Admin-only routes**: 
  - `POST /api/books` - Create books
  - `PUT /api/books/:id` - Update books (creator only)
  - `DELETE /api/books/:id` - Delete books (creator only)

✅ **Owner-only routes**:
  - `PUT /api/reviews/:id` - Update reviews (review author only)
  - `DELETE /api/reviews/:id` - Delete reviews (review author only)
  - `PUT /users/:id` - Update profile (profile owner only)

### Security Features
- JWT tokens with expiration (30 min access, 7 day refresh)
- HTTP-only cookies for refresh tokens
- Password hashing with bcrypt
- File upload validation and size limits (5MB max)
- Input sanitization and validation
- CORS protection
- Cloudinary secure image storage
- One review per user per book policy

---

## Error Responses

✅ All API endpoints return consistent error responses with proper HTTP status codes:

### Error Response Format
```json
{
  "error": {
    "message": "Error description",
    "statusCode": 400
  }
}
```

### HTTP Status Codes
- **200** - Success
- **201** - Created successfully
- **400** - Bad Request (validation errors, invalid data)
- **401** - Unauthorized (missing, invalid, or expired token)
- **403** - Forbidden (insufficient permissions, wrong role)
- **404** - Not Found (resource doesn't exist)
- **500** - Internal Server Error

### Common Error Messages
✅ **Authentication Errors:**
- `"Invalid credentials"` - Login failed (wrong email/password)
- `"Token missing"` - Authorization header missing
- `"Invalid or expired token"` - JWT token invalid or expired
- `"Refresh token missing"` - Refresh token cookie not found

✅ **Authorization Errors:**
- `"Access denied"` - Insufficient permissions for action
- `"Admin role required"` - Non-admin trying to access admin endpoint
- `"You are not authorized to [action] this [resource]"` - Ownership violation

✅ **Validation Errors:**
- `"Validation failed"` - Request body validation errors
- `"Rating must be between 1 and 5"` - Invalid review rating
- `"You have already reviewed this book"` - Duplicate review attempt

✅ **Resource Errors:**
- `"Resource not found"` - Requested resource doesn't exist
- `"Book not found"` - Invalid book ID
- `"User not found"` - Invalid user ID
- `"Review not found"` - Invalid review ID

✅ **File Upload Errors:**
- `"Failed to upload cover image"` - Cloudinary upload failed
- `"File size too large"` - File exceeds 5MB limit
- `"Invalid file type"` - Non-image file uploaded

---

## Implementation Notes

✅ **Data & Storage:**
1. **Timestamps**: All resources include `createdAt` and `updatedAt` fields
2. **ObjectIds**: All `_id` fields are MongoDB ObjectIds (24 character hex strings)
3. **Cloudinary**: Images uploaded to `/book-covers/` folder with optimization
4. **Database**: MongoDB with Mongoose ODM

✅ **Authentication & Security:**
5. **Cookies**: Refresh tokens stored in secure HTTP-only cookies with appropriate flags
6. **Token Refresh**: Clients should implement automatic token refresh on 401 responses
7. **Authorization**: Resource ownership verified for all update/delete operations
8. **CORS**: Configured for specific origins in development

✅ **API Features:**
9. **Pagination**: Default page size is 10, maximum is 100
10. **Search**: Text search is case-insensitive and searches title/author fields
11. **Sorting**: Use `-` prefix for descending order (e.g., `-createdAt`)
12. **Reviews**: Users can only have one review per book (enforced by unique compound index)

✅ **File Management:**
13. **Auto-cleanup**: Old images automatically cleaned up when books are updated or deleted
14. **Validation**: File type and size validation on upload
15. **Optimization**: Automatic image optimization via Cloudinary

---
