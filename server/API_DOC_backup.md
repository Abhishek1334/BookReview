# Book Review Platform API Documentation

---

## Table of Contents
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Books](#books)
- [Reviews](#reviews)
- [Users](#users)
- [Error Responses](#error-responses)

---

## Base URL
**Local Development:** `http://localhost:3000`
**Production:** TBD

---

## Authentication

All protected routes require a Bearer token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

Refresh tokens are handled via secure HTTP-only cookies.

### Register a New User
**POST** `/auth/register`
- **Description:** Register a new user account.
- **Auth:** No
- **Content-Type:** `application/json`
- **Request Body:**
  | Field     | Type   | Required | Validation | Description         |
  |-----------|--------|----------|------------|---------------------|
  | name      | string | Yes      | Non-empty  | User's full name    |
  | email     | string | Yes      | Valid email| User's email        |
  | password  | string | Yes      | Min 6 chars| User's password     |

- **Response (201):**
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
- **Errors:** 
  - 400: Validation failed, Email already registered
  - 500: Server error

---

### Login
**POST** `/auth/login`
- **Description:** Authenticate user and receive tokens.
- **Auth:** No
- **Content-Type:** `application/json`
- **Request Body:**
  | Field    | Type   | Required | Validation |
  |----------|--------|----------|------------|
  | email    | string | Yes      | Valid email|
  | password | string | Yes      | Non-empty  |

- **Response (200):**
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
- **Errors:** 
  - 400: Validation failed
  - 401: Invalid credentials
  - 500: Server error

---

### Refresh Access Token
**POST** `/auth/refresh`
- **Description:** Get a new access token using the refresh token cookie.
- **Auth:** No (uses httpOnly refresh token cookie)
- **Response (200):**
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
- **Errors:** 
  - 401: Refresh token missing
  - 403: Invalid or expired refresh token
  - 500: Server error

---

### Logout
**POST** `/auth/logout`
- **Description:** Logout and clear the refresh token cookie.
- **Auth:** No
- **Response (200):**
  ```json
  {
    "message": "Logged out successfully"
  }
  ```
- **Errors:** 500: Server error

---

### Get Current User Info
**GET** `/auth/me`
- **Description:** Get the authenticated user's profile information.
- **Auth:** Yes (Bearer token required)
- **Response (200):**
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
- **Errors:** 
  - 401: Unauthorized (invalid/missing token)
  - 404: User not found
  - 500: Server error

---

## Books

### Image Upload Requirements
- **Supported formats:** JPEG, JPG, PNG
- **Maximum file size:** 5MB
- **Field name:** `coverImage`
- **Storage:** Cloudinary
- **Content-Type:** `multipart/form-data` (when uploading files)

**Note:** When sending form data with files, genres should be sent as a JSON string (e.g., `'["Fiction", "Mystery"]'`) or as individual values.

---

### List All Books
**GET** `/api/books`
- **Description:** Retrieve all books with pagination, search, genre filter, and sorting. Includes aggregated review statistics.
- **Auth:** No
- **Query Parameters:**
  | Name   | Type   | Default      | Validation | Description                                      |
  |--------|--------|--------------|------------|--------------------------------------------------|
  | page   | number | 1            | >= 1       | Page number                                      |
  | limit  | number | 10           | 1-100      | Results per page (max 100)                      |
  | search | string |              |            | Search in title or author (case-insensitive)    |
  | genre  | string |              |            | Filter by exact genre match                     |
  | sort   | string | -createdAt   | See below  | Sort field (createdAt, title, author with -)    |

**Allowed sort values:** `createdAt`, `-createdAt`, `title`, `-title`, `author`, `-author`

- **Response (200):**
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
- **Errors:** 500: Server error
- **Examples:**
  - `/api/books?page=2&limit=5`
  - `/api/books?search=gatsby`
  - `/api/books?genre=Fiction`
  - `/api/books?sort=-title`

---

### Get Book Details
**GET** `/api/books/:id`
- **Description:** Retrieve a specific book by ID, including average rating and review count.
- **Auth:** No
- **Path Parameters:**
  | Name | Type   | Description  |
  |------|--------|--------------|
  | id   | string | Book ObjectId|

- **Response (200):**
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
- **Errors:** 
  - 404: Book not found
  - 500: Server error

---

### Add a New Book
**POST** `/api/books`
- **Description:** Add a new book (admin only).
- **Auth:** Yes (Bearer token required, admin role)
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  | Field       | Type         | Required | Description                    |
  |-------------|--------------|----------|--------------------------------|
  | title       | string       | Yes      | Book title                     |
  | author      | string       | Yes      | Book author                    |
  | description | string       | No       | Book description               |
  | genres      | string/array | No       | Book genres (JSON string or array) |
  | coverImage  | file         | No       | Cover image (JPEG/PNG, max 5MB)|

- **Response (201):**
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
- **Errors:** 
  - 400: Title and author are required
  - 401: Unauthorized
  - 403: Admin role required
  - 500: Server error, Failed to upload cover image

---

### Update a Book
**PUT** `/api/books/:id`
- **Description:** Update a book (creator only).
- **Auth:** Yes (Bearer token required, book creator only)
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

- **Response (200):**
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
- **Errors:** 
  - 403: You are not authorized to update this book
  - 404: Book not found
  - 500: Server error, Failed to upload cover image

---

### Delete a Book
**DELETE** `/api/books/:id`
- **Description:** Delete a book (creator only). Also deletes associated cover image from Cloudinary.
- **Auth:** Yes (Bearer token required, book creator only)
- **Path Parameters:**
  | Name | Type   | Description  |
  |------|--------|--------------|
  | id   | string | Book ObjectId|

- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Book deleted successfully"
  }
  ```
- **Errors:** 
  - 403: You are not authorized to delete this book
  - 404: Book not found
  - 500: Server error

---

## Reviews

### List All Reviews
**GET** `/api/reviews`
- **Description:** Get all reviews with pagination and filtering options.
- **Auth:** No
- **Query Parameters:**
  | Name   | Type   | Default      | Validation | Description                                                        |
  |--------|--------|--------------|-----------|--------------------------------------------------------------------|
  | page   | number | 1            | >= 1      | Page number                                                        |
  | limit  | number | 10           | 1-100     | Results per page (max 100)                                        |
  | book   | string |              |           | Filter by book ObjectId                                           |
  | user   | string |              |           | Filter by user ObjectId                                           |
  | sort   | string | -createdAt   |           | Sort by field. Prefix with `-` for descending                     |

- **Response (200):**
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
- **Errors:** 500: Server error
- **Examples:**
  - `/api/reviews?user=507f1f77bcf86cd799439011&sort=-rating`
  - `/api/reviews?book=507f1f77bcf86cd799439011&page=2`

---

### List Reviews for a Book
**GET** `/api/reviews/:bookId`
- **Description:** Get all reviews for a specific book, sorted by creation date (newest first).
- **Auth:** No
- **Path Parameters:**
  | Name   | Type   | Description  |
  |--------|--------|--------------|
  | bookId | string | Book ObjectId|

- **Response (200):**
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
- **Errors:** 500: Server error

---

### Add a Review
**POST** `/api/reviews/:bookId`
- **Description:** Add a review for a book (one review per user per book).
- **Auth:** Yes (Bearer token required)
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

- **Response (201):**
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
- **Errors:** 
  - 400: Rating must be between 1 and 5, You have already reviewed this book
  - 401: Unauthorized
  - 404: Book not found
  - 500: Server error

---

### Update a Review
**PUT** `/api/reviews/:reviewId`
- **Description:** Update your own review.
- **Auth:** Yes (Bearer token required, review owner only)
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

- **Response (200):**
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
- **Errors:** 
  - 400: Rating must be between 1 and 5
  - 401: Unauthorized
  - 403: You are not authorized to update this review
  - 404: Review not found
  - 500: Server error

---

### Delete a Review
**DELETE** `/api/reviews/:reviewId`
- **Description:** Delete your own review.
- **Auth:** Yes (Bearer token required, review owner only)
- **Path Parameters:**
  | Name     | Type   | Description    |
  |----------|--------|----------------|
  | reviewId | string | Review ObjectId|

- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Review deleted successfully"
  }
  ```
- **Errors:** 
  - 401: Unauthorized
  - 403: You are not authorized to delete this review
  - 404: Review not found
  - 500: Server error

---

## Users

### Get User Profile
**GET** `/users/:id`
- **Description:** Retrieve public profile information for a user by ID.
- **Auth:** No
- **Path Parameters:**
  | Name | Type   | Description  |
  |------|--------|--------------|
  | id   | string | User ObjectId|

- **Response (200):**
  ```json
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
  ```
- **Errors:** 
  - 404: User not found
  - 500: Server error

---

### Update User Profile
**PUT** `/users/:id`
- **Description:** Update your own profile (name only).
- **Auth:** Yes (Bearer token required, profile owner only)
- **Content-Type:** `application/json`
- **Path Parameters:**
  | Name | Type   | Description  |
  |------|--------|--------------|
  | id   | string | User ObjectId|

- **Request Body:**
  | Field  | Type   | Required | Validation | Description         |
  |--------|--------|----------|------------|---------------------|
  | name   | string | Yes      | Non-empty  | New display name    |

- **Response (200):**
  ```json
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Updated",
    "email": "john@example.com",
    "role": "user"
  }
  ```
- **Errors:** 
  - 400: Name is required, Name must be a non-empty string
  - 401: Unauthorized
  - 403: You are not authorized to update this profile
  - 404: User not found
  - 500: Server error

---

## Error Responses

All API endpoints return consistent error responses:

### Error Response Format
```json
{
  "error": {
    "message": "Error description",
    "statusCode": 400
  }
}
```

### Common HTTP Status Codes
- **200** - Success
- **201** - Created
- **400** - Bad Request (validation errors, invalid data)
- **401** - Unauthorized (missing or invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found (resource doesn't exist)
- **500** - Internal Server Error

### Common Error Messages
- `"Validation failed"` - Request body validation errors
- `"Invalid credentials"` - Login failed
- `"Token missing"` - Authorization header missing
- `"Invalid or expired token"` - JWT token invalid
- `"Access denied"` - Insufficient permissions
- `"Resource not found"` - Requested resource doesn't exist
- `"Server error"` - Internal server error

---

## Notes

1. **Timestamps**: All resources include `createdAt` and `updatedAt` fields
2. **ObjectIds**: All `_id` fields are MongoDB ObjectIds (24 character hex strings)
3. **Cookies**: Refresh tokens are stored in secure HTTP-only cookies
4. **File Upload**: Images are uploaded to Cloudinary and URLs are returned
5. **Pagination**: Default page size is 10, maximum is 100
6. **Search**: Text search is case-insensitive and searches title/author fields
7. **Sorting**: Use `-` prefix for descending order (e.g., `-createdAt`)
8. **Reviews**: Users can only have one review per book (enforced by unique index)
9. **Authorization**: Book creators can edit/delete their books, review authors can edit/delete their reviews

--- 