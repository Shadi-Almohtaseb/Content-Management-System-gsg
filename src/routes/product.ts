import express from 'express';
import { authenticateShop } from '../middleware/auth.js';
import { ExpressNS } from '../../@types/index.js';
import { createProductController, getProductByIdController } from '../controllers/product.js';
import { AppError } from '../utils/errorHandler.js';
import { UploadedFile } from 'express-fileupload';
import { v2 as cloudinary } from 'cloudinary';
const router = express.Router();

/* POST create product. */
router.post("/", authenticateShop, async (req: ExpressNS.RequestWithShop, res: express.Response, next: express.NextFunction) => {
  try {
    const shop = req.shop;
    if (!shop) {
      throw new AppError("Shop not found", 404, true);
    }
    if (!req.body.name || !req.body.short_description || !req.body.originalPrice || !req.body.stock) {
      throw new AppError("Some fields are missing", 400, true);
    }

    // // Check if files are present in the request
    // if (!req.files || Object.keys(req.files).length === 0) {
    //   throw new AppError("Images are required", 400, true);
    // }

    // const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'video/mp4'];

    // // Handle multiple files
    // const cloudinaryResponses = [];

    // for (const fileKey in req.files) {
    //   const file = req.files[fileKey] as UploadedFile;

    //   if (!allowedMimeTypes.includes(file.mimetype)) {
    //     throw new AppError(`Invalid file type for ${fileKey}`, 400, true);
    //   }

    //   // Convert image data to base64
    //   const base64Image = file.data.toString('base64');

    //   // Upload image to Cloudinary
    //   const cloudinaryResponse = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${base64Image}`, { folder: 'products' });

    //   cloudinaryResponses.push(cloudinaryResponse);
    // }

    const data = await createProductController(req.body, shop);

    res.status(201).json({
      status: "success",
      message: "Product created successfully",
      data: data,
    });
  } catch (error) {
    next(error);
  }
});

/* GET get product by id */
router.get("/:id", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const data = await getProductByIdController(Number(req.params.id));
    res.status(200).json({ success: true, message: "Product retrieved successfully", data });
  } catch (error) {
    next(error);
  }
});

export default router;