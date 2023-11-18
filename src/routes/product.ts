import express from 'express';
import { authenticateShop } from '../middleware/auth.js';
import { ExpressNS } from '../../@types/index.js';
import { createProductController, getAllProductController, getProductByIdController } from '../controllers/product.js';
import { AppError } from '../utils/errorHandler.js';
import { UploadedFile } from 'express-fileupload';
import { uploadImageToCloudinary } from '../utils/cloudinaryMethods.js';
import { ProductVariant } from '../db/entities/ProductVariants.js';
const router = express.Router();

/* POST create product. */
router.post("/", authenticateShop, async (req: ExpressNS.RequestWithShop, res: express.Response, next: express.NextFunction) => {
  try {
    const shop = req.shop;
    if (!shop) {
      throw new AppError("Shop not found", 404, true);
    }

    if (!req.body.name || !req.body.long_description || !JSON.parse(req.body.variants).map((item: ProductVariant) => item.originalPrice) || !req.body.categories || !req.body.tags) {
      throw new AppError("Some fields are missing", 400, true);
    }

    const uploadedFiles = Array.isArray(req.files?.images) ? req.files?.images : [req.files?.images];

    if (!uploadedFiles || uploadedFiles.length === 0) {
      throw new AppError("Images are required", 400, true);
    }
    // Handle multiple files
    const cloudinaryResponses = [];

    for (const file of uploadedFiles) {
      const cloudinaryResponse = await uploadImageToCloudinary(file || {} as UploadedFile, "products");
      cloudinaryResponses.push(cloudinaryResponse);
    }

    const product = await createProductController({
      ...req.body,
      variants: JSON.parse(req.body.variants),
      images: cloudinaryResponses.map(response => response.secure_url)
    }, shop);

    res.status(201).json({
      status: "success",
      message: "Product created successfully",
      product: product,
    });
  } catch (error) {
    next(error);
  }
});


/* GET get product by id */
router.get("/:id", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const product = await getProductByIdController(Number(req.params.id));
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
});

/* GET All products */
router.get("/", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const payload = {
      page: req.query.page?.toString() || '1',
      pageSize: req.query.pageSize?.toString() || '10',
      q: req.query.q?.toString() || '',
      category: req.query.category?.toString() || '',
    };
    const products = await getAllProductController(payload);
    res.status(200).json({
      page: payload.page,
      pageSize: payload.pageSize,
      q: payload.q,
      total: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
})

export default router;