# Cloudinary Image Upload Setup

This guide explains how to set up Cloudinary for image upload functionality in the Book Review Platform.

## Prerequisites

1. Create a free Cloudinary account at [https://cloudinary.com/](https://cloudinary.com/)
2. Go to your Cloudinary Dashboard

## Configuration

### 1. Environment Variables

In your `.env` file, replace the placeholder values with your actual Cloudinary credentials:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

You can find these values in your Cloudinary Dashboard under "Account Details".

### 2. Testing the Setup

Run the test script to verify your configuration:

```bash
node test-cloudinary.js
```

If configured correctly, you should see:
```
✅ Upload successful!
Image URL: https://res.cloudinary.com/your_cloud_name/image/upload/...
```

## Features

### Image Upload
- **Supported formats:** JPEG, JPG, PNG
- **Maximum file size:** 5MB
- **Storage location:** Cloudinary `/book-covers` folder
- **Automatic optimization:** Quality and format optimization enabled

### API Usage

#### Create Book with Image
```bash
curl -X POST http://localhost:5000/api/books \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Book Title" \
  -F "author=Author Name" \
  -F "description=Book description" \
  -F "genres=[\"Fiction\", \"Mystery\"]" \
  -F "coverImage=@/path/to/image.jpg"
```

#### Update Book with New Image
```bash
curl -X PUT http://localhost:5000/api/books/BOOK_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Updated Title" \
  -F "coverImage=@/path/to/new-image.jpg"
```

### Image Management
- **Upload:** New images are uploaded to Cloudinary
- **Update:** Old images are automatically deleted when replaced
- **Delete:** Images are removed from Cloudinary when books are deleted

## Error Handling

The API provides detailed error messages for:
- File size too large (>5MB)
- Invalid file types (non-JPEG/PNG)
- Upload failures
- Missing Cloudinary credentials

## Folder Structure

Images are organized in Cloudinary:
```
/book-covers/
  ├── book_id_1.jpg
  ├── book_id_2.png
  └── ...
```

## Security

- File type validation prevents malicious uploads
- Size limits prevent abuse
- Only authenticated admin users can create books
- Only book creators can update/delete their books 