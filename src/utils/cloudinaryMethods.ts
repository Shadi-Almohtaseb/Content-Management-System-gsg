import { v2 as cloudinary } from 'cloudinary';
import { UploadedFile } from 'express-fileupload';
import { AppError } from './errorHandler.js';

export const getPublicIdFromCloudinaryUrl = (imageUrl: string) => {
  // Split the Cloudinary URL by '/'
  const urlParts = imageUrl.split('/');

  // Get the public ID (3rd element from the end)
  const filename = urlParts[urlParts.length - 1];
  // Remove the file extension
  const publicId = filename.split('.')[0];

  return publicId || null;
}

export const deleteImageFromCloudinary = (publicId: string) => {
  if (publicId) {
    // Delete image from Cloudinary using the public ID
    return cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error("Error deleting image from Cloudinary:", error);
      } else {
        console.log("Image deleted from Cloudinary:", result);
      }
    });
  }
  return null;
};

/**
 * Uploads an image to Cloudinary.
 * @param file - The file to be uploaded.
 * @returns {Promise<any>} - A promise that resolves with the Cloudinary response.
 */
export async function uploadImageToCloudinary(file: UploadedFile, folder: string): Promise<any> {
  const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'video/mp4'];

  if (!file || !allowedMimeTypes.includes(file.mimetype)) {
    throw new AppError(`Invalid file type for ${file?.name || 'unknown file'}`, 400, true);
  }

  // Convert image data to base64
  const base64Image = file.data.toString('base64');

  // Upload image to Cloudinary
  return cloudinary.uploader.upload(`data:${file.mimetype};base64,${base64Image}`, { folder });
}
