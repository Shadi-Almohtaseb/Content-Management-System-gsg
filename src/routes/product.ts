import express from 'express';
import { authenticateShop } from '../middleware/auth.js';
import { ExpressNS } from '../../@types/index.js';
import { createProductController, deleteProductController, getAllProductController, getProductByIdController, getProductsByListIdsController, getProductsByShopIdController, getProductsByVariantIdsController } from '../controllers/product.js';
import { AppError } from '../utils/errorHandler.js';
import { UploadedFile } from 'express-fileupload';
import { uploadImageToCloudinary } from '../utils/cloudinaryMethods.js';
import { ProductVariant } from '../db/entities/ProductVariants.js';
import { Product } from '../db/entities/Product.js';
const router = express.Router();

/* POST create product. */
router.post("/", authenticateShop, async (req: ExpressNS.RequestWithShop, res: express.Response, next: express.NextFunction) => {
  try {
    const shop = req.shop;
    if (!shop) {
      throw new AppError("you are unauthorized, login to continue", 404, true);
    }

    if (!req.body.name || !req.body.long_description || (req.body?.variants && !JSON.parse(req.body?.variants).map((item: ProductVariant) => item.originalPrice)) || !req.body.categories || !req.body.tags) {
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

    console.log("cloudinaryResponses", cloudinaryResponses);

    const product = await createProductController({
      ...req.body,
      variants: JSON.parse(req.body?.variants || "[]"),
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
    const rangePrise = products.map((product: Product) => {
      const prices = product.variants.map((variant: ProductVariant | any) => variant.originalPrice);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      return {
        minPrice,
        maxPrice
      }
    });

    const lastPage = Math.ceil(products.length / Number(payload.pageSize));
    const pagination = {
      page: Number(payload.page),
      pageSize: Number(payload.pageSize),
      q: payload.q,
      lastPage,
      total: products.length,
    }

    products.forEach((product: any, index: number) => {
      product.rangePrice = rangePrise[index];
    });
    res.status(200).json({
      status: "success",
      pagination,
      products
    });
  } catch (error) {
    next(error);
  }
})

// Get products of a shop
router.get("/shop/:shopId", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const payload = {
      page: req.query.page?.toString() || '1',
      pageSize: req.query.pageSize?.toString() || '10',
      q: req.query.q?.toString() || '',
      category: req.query.category?.toString() || '',
      shopId: Number(req.params.shopId)
    };
    const products = await getProductsByShopIdController(payload);
    const rangePrise = products.map((product: Product) => {
      const prices = product.variants.map((variant: ProductVariant | any) => variant.originalPrice);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      return {
        minPrice,
        maxPrice
      }
    });

    const lastPage = Math.ceil(products.length / Number(payload.pageSize));
    const pagination = {
      page: Number(payload.page),
      pageSize: Number(payload.pageSize),
      q: payload.q,
      lastPage,
      total: products.length,
    }

    products.forEach((product: any, index: number) => {
      product.rangePrice = rangePrise[index];
    });
    res.status(200).json({
      status: "success",
      pagination,
      products
    });
  } catch (error) {
    next(error);
  }
})

// Get Products by list of ids
router.post("/list", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const ids = req.body.ids;
    console.log("ids", ids);

    if (!ids || !Array.isArray(ids)) {
      throw new AppError("ids is required and must be an array", 400, true);
    }

    const products = await getProductsByListIdsController(ids);

    const rangePrise = products.map((product: Product) => {
      const prices = product.variants.map((variant: ProductVariant | any) => variant.originalPrice);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      return {
        minPrice,
        maxPrice
      }
    });

    products.forEach((product: any, index: number) => {
      product.rangePrice = rangePrise[index];
    });

    res.status(200).json({
      status: "success",
      products
    });
  } catch (error) {
    next(error);
  }
})

// Get Products By Variant Ids
router.post("/variants", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const ids = req.body.variant_ids;
    console.log("ids", ids);

    if (!ids || !Array.isArray(ids)) { }
    const products = await getProductsByVariantIdsController(ids);

    const rangePrise = products.map((product: Product) => {
      const prices = product.variants.map((variant: ProductVariant | any) => variant.originalPrice);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      return {
        minPrice,
        maxPrice
      }
    });

    products.forEach((product: any, index: number) => {
      product.rangePrice = rangePrise[index];
    });

    res.status(200).json({
      status: "success",
      products
    });

  } catch (error) {
    next(error);
  }
})

/* DELETE update product */
router.delete("/:id", authenticateShop, async (req: ExpressNS.RequestWithShop, res: express.Response, next: express.NextFunction) => {
  try {
    const shop = req.shop;
    if (!shop) {
      throw new AppError("you are unauthorized, login to continue", 404, true);
    }

    const productId = Number(req.params.id);
    await deleteProductController(productId, shop);

    res.status(200).json({
      status: "success",
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;