import { v2 as cloudinary } from 'cloudinary';

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
