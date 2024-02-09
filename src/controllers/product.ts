import { In } from "typeorm";
import dataSource from "../db/dataSource.js";
import { Category } from "../db/entities/Category.js";
import { Product } from "../db/entities/Product.js";
import { Shop } from "../db/entities/Shop.js";
import { Tag } from "../db/entities/Tag.js";
import { ProductVariant } from "../db/entities/ProductVariants.js";
import { pagination } from "../../@types/index.js";
import { AppError } from "../utils/errorHandler.js";
import { deleteImageFromCloudinary, getPublicIdFromCloudinaryUrl } from "../utils/cloudinaryMethods.js";

const createProductController = async (payload: Product & { variants: ProductVariant[] }, shop: Shop) => {
  return dataSource.manager.transaction(async transaction => {
    const newProduct = Product.create({
      ...payload,
      shop: shop,
      createdAt: new Date(),
    });

    newProduct.categories = await Category.findBy({
      id: In(payload.categories as Category[])
    }) as Category[];

    newProduct.tags = await Tag.findBy({
      id: In(payload.tags as Tag[])
    }) as Tag[];

    await transaction.save(newProduct);

    if (payload.variants && payload.variants.length > 0) {
      const variants = payload.variants.map(variantData => {
        const variant = ProductVariant.create({
          ...variantData,
          product: newProduct,
        });
        return variant;
      });

      // Save the variants
      await transaction.save(variants);
    }

    return newProduct;
  });
}

const getProductByIdController = async (id: number) => {
  const product = Product.findOne({ where: { id: id }, relations: ['variants', 'shop'], select: { shop: { shop_id: true, avatar: true, shopName: true, email: true } }, });
  if (!product) {
    throw new AppError("Product not found", 404, true);
  }
  return product;
}

const getAllProductController = async (payload: pagination) => {
  const page = parseInt(payload.page);
  const pageSize = parseInt(payload.pageSize);
  const q = payload.q
  const category = payload.category
  const products = Product.find({
    relations: ['variants', 'shop', "categories"],
    select: { shop: { shop_id: true, avatar: true, shopName: true, email: true } },
    skip: pageSize * (page - 1),
    take: pageSize,
    order: {
      createdAt: "DESC"
    },
    where: category ? { categories: { name: category } } : undefined,
  });

  return products;
}

const getProductsByShopIdController = async (payload: pagination) => {
  const page = parseInt(payload.page);
  const pageSize = parseInt(payload.pageSize);
  const q = payload.q
  const shopId = payload.shopId
  const products = Product.find({
    relations: ['variants', 'shop', "categories"],
    select: { shop: { shop_id: true, avatar: true, shopName: true, email: true } },
    skip: pageSize * (page - 1),
    take: pageSize,
    order: {
      createdAt: "DESC"
    },
    where: shopId ? { shop: { shop_id: shopId } as any } : undefined,
  });

  return products;
}

const getProductsByListIdsController = async (ids: number[]) => {
  // Check if ids is an array and it contains valid numbers
  if (!Array.isArray(ids) || ids.some(id => typeof id !== 'number' || isNaN(id))) {
    throw new Error('Invalid input: ids must be an array of numbers');
  }

  // Await the Product.find() method to get the actual products
  const products = await Product.find({
    relations: ['variants', 'categories'],
    select: { variants: { originalPrice: true, discountPrice: true } },
    where: { id: In(ids) }
  });

  return products;
}

const getProductsByVariantIdsController = async (ids: number[]) => {
  // Check if ids is an array and it contains valid numbers
  if (!Array.isArray(ids) || ids.some(id => typeof id !== 'number' || isNaN(id))) {
    throw new Error('Invalid input: ids must be an array of numbers');
  }

  // Await the Product.find() method to get the actual products
  const products = await Product.find({
    relations: ['variants'],
    where: { variants: { variant_id: In(ids) } }
  });

  return products;
}

const deleteProductController = async (id: number, shop: Shop) => {
  const product = await Product.findOne({ where: { id: id }, relations: ['shop', 'variants'] });
  if (!product) {
    throw new AppError("Product not found", 404, true);
  }

  if (product.shop.shop_id !== shop?.shop_id) {
    throw new AppError("You are not authorized to perform this action", 403, true);
  }

  await ProductVariant.delete({ product: { id: product.id } });

  // remove product with cascade
  await product.remove();

  // Delete image from Cloudinary using the public ID
  let publicId = getPublicIdFromCloudinaryUrl(product.images);
  if (!publicId) {
    throw new AppError("Something went wrong with deleting image", 400, true);
  }
  publicId = `products/${publicId}`
  await deleteImageFromCloudinary(publicId);
}

export {
  createProductController,
  getProductByIdController,
  getAllProductController,
  deleteProductController,
  getProductsByShopIdController,
  getProductsByListIdsController,
  getProductsByVariantIdsController
}