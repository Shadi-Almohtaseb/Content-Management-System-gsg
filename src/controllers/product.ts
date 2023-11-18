import { In } from "typeorm";
import dataSource from "../db/dataSource.js";
import { Category } from "../db/entities/Category.js";
import { Product } from "../db/entities/Product.js";
import { Shop } from "../db/entities/Shop.js";
import { Tag } from "../db/entities/Tag.js";
import { ProductVariant } from "../db/entities/ProductVariants.js";
import { pagination } from "../../@types/index.js";

const createProductController = async (payload: Product & { variants: ProductVariant[] }, shop: Shop) => {
  return dataSource.manager.transaction(async transaction => {
    const newProduct = Product.create({
      ...payload,
      shop: shop,
    });
    console.log("payload.categories", payload.categories);

    newProduct.categories = await Category.findBy({
      id: In(payload.categories as Category[])
    }) as Category[];

    console.log("newProduct.categories", newProduct.categories);


    console.log("payload.tags", payload.tags);
    newProduct.tags = await Tag.findBy({
      id: In(payload.tags as Tag[])
    }) as Tag[];

    await transaction.save(newProduct);
    console.log("newProduct.tags", newProduct.tags);

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
    throw new Error("Product not found");
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

export { createProductController, getProductByIdController, getAllProductController }