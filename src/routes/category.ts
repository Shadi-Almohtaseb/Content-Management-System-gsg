import express from 'express';
import { createCategoryController, getAllCategoriesController, getCategoryController, updateCategoryController } from '../controllers/category.js';
import { AppError } from '../utils/errorHandler.js';
import { v2 as cloudinary } from 'cloudinary';
import { UploadedFile } from 'express-fileupload';
import { deleteImageFromCloudinary, getPublicIdFromCloudinaryUrl } from '../utils/cloudinaryMethods.js';
const router = express.Router();

/* POST create category. */
router.post("/", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    if (!req.body.name || !req.files) {
      throw new AppError("Some fields are missing", 400, true);
    }

    const uploadedFile = req.files?.image as UploadedFile;

    if (!uploadedFile || !uploadedFile.data) {
      throw new AppError("Image is required", 400, true);
    }

    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'video/mp4'];
    if (!allowedMimeTypes.includes(uploadedFile.mimetype)) {
      throw new AppError("Invalid file type", 400, true);
    }

    // Convert image data to base64
    const base64Image = uploadedFile.data.toString('base64');

    // Upload image to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(`data:${uploadedFile.mimetype};base64,${base64Image}`, { folder: 'categories' });

    // Create category with the Cloudinary URL
    const data = await createCategoryController(req.body, cloudinaryResponse.secure_url);
    res.status(201).json({ success: true, message: "Category created successfully", data });
  } catch (error) {
    next(error);
  }
});


/* GET get all categories */
router.get("/", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const data = await getAllCategoriesController();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
})

/* GET category by id */
router.get("/:id", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const data = await getCategoryController(Number(req.params.id));
    res.status(200).json({ success: true, message: "Categories retrieved successfully", data });
  } catch (error) {
    next(error);
  }
})

/* DELETE category */
router.delete("/:id", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const categoryId = Number(req.params.id);

    // Retrieve category to get the image URL
    const category = await getCategoryController(categoryId);

    if (!category) {
      throw new AppError("Category not found", 404, true);
    }

    // Delete image from Cloudinary using the public ID
    let publicId = getPublicIdFromCloudinaryUrl(category.image);
    if (!publicId) {
      throw new AppError("Something went wrong with deleting image", 400, true);
    }
    publicId = `categories/${publicId}`
    await deleteImageFromCloudinary(publicId);

    // Delete category from the database
    await category.remove();

    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    next(error);
  }
});

/* PUT update category */
router.put("/:id", async (req, res, next) => {
  try {
    const uploadedFile = req.files?.image as UploadedFile;

    // Retrieve category to get the image URL
    const categoryId = Number(req.params.id);
    const category = await getCategoryController(categoryId);

    if (!category) {
      throw new AppError("Category not found", 404, true);
    }

    if (uploadedFile && uploadedFile.data) {
      const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'video/mp4'];
      if (!allowedMimeTypes.includes(uploadedFile.mimetype)) {
        throw new AppError("Invalid file type", 400, true);
      }

      // Convert image data to base64
      const base64Image = uploadedFile.data.toString('base64');

      // Get the old image's public ID from the Cloudinary URL
      let oldImagePublicId = getPublicIdFromCloudinaryUrl(category.image);
      if (!oldImagePublicId) {
        throw new AppError("Something went wrong with deleting image", 400, true);
      }

      // Assuming the old image public ID is stored in a specific folder
      oldImagePublicId = `categories/${oldImagePublicId}`;

      // Upload image to Cloudinary with the same public ID as the old image
      const cloudinaryResponse = await cloudinary.uploader.upload(
        `data:${uploadedFile.mimetype};base64,${base64Image}`,
        { folder: 'categories' }
      );

      // Delete the old image from Cloudinary
      await deleteImageFromCloudinary(oldImagePublicId);

      // Update the category in the database with the new image URL or public ID
      const updatedCategory = await updateCategoryController(categoryId, {
        ...req.body,
        image: cloudinaryResponse.secure_url,
      });

      res.status(200).json({ success: true, message: "Category updated successfully", data: updatedCategory });
    } else {
      // If no new image is provided, update the category without modifying the image
      const updatedCategory = await updateCategoryController(categoryId, req.body);
      res.status(200).json({ success: true, message: "Category updated successfully", data: updatedCategory });
    }
  } catch (error) {
    next(error);
  }
});


export default router;