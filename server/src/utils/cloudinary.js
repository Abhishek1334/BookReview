import { v2 as cloudinary } from 'cloudinary';

// Function to ensure Cloudinary is configured
const ensureCloudinaryConfig = () => {
    if (!cloudinary.config().cloud_name) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }
};

/**
 * Upload image buffer to Cloudinary
 * @param {Buffer} buffer - Image buffer
 * @param {string} folder - Cloudinary folder (optional)
 * @returns {Promise<string>} - Secure URL of uploaded image
 */
export const uploadImage = async (buffer, folder = 'book-covers') => {
    try {
        ensureCloudinaryConfig();
        
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: 'image',
                    folder: folder,
                    quality: 'auto',
                    fetch_format: 'auto',
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(new Error('Failed to upload image to Cloudinary'));
                    } else {
                        resolve(result.secure_url);
                    }
                }
            ).end(buffer);
        });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image to Cloudinary');
    }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<object>} - Deletion result
 */
export const deleteImage = async (publicId) => {
    try {
        ensureCloudinaryConfig();
        
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error('Failed to delete image from Cloudinary');
    }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string} - Public ID
 */
export const extractPublicId = (url) => {
    if (!url || !url.includes('cloudinary.com')) {
        return null;
    }
    
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    
    const pathAfterUpload = parts.slice(uploadIndex + 2).join('/');
    const publicIdWithExtension = pathAfterUpload.split('/').pop();
    const publicId = publicIdWithExtension.split('.')[0];
    
    return `book-covers/${publicId}`;
};

export default cloudinary; 