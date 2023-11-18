import { In } from "typeorm";
import dataSource from "../db/dataSource.js";
import { Category } from "../db/entities/Category.js";
import { Product } from "../db/entities/Product.js";
import { Shop } from "../db/entities/Shop.js";

const createProductController = async (payload: Product, shop: Shop) => {
  return dataSource.manager.transaction(async transaction => {
    const newProduct = Product.create({
      ...payload,
      shop: shop,
    });
    newProduct.categories = await Category.findBy({
      id: In(payload.categories as number[])
    }) as any;

    console.log("newProduct.categories", newProduct.categories);
    console.log("payload.categories", payload.categories);

    return transaction.save(newProduct);
  });
}

const getProductByIdController = async (id: number) => {
  const product = Product.findOne({ where: { id: id }, relations: ['categories'] });
  if (!product) {
    throw new Error("Product not found");
  }
  return product;
}

export { createProductController, getProductByIdController }