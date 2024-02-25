import { In } from "typeorm";
import { Order } from "../db/entities/Order.js";
import { Product } from "../db/entities/Product.js";
import { Shop } from "../db/entities/Shop.js";
import { User } from "../db/entities/User.js";
import { ProductVariant } from "../db/entities/ProductVariants.js";

const createOrderController = async (orderData: Order, user: User) => {
  // const variants = await ProductVariant.find({
  //   where: {
  //     variant_id: In(orderData.variants)
  //   }
  // });

  // Get products from variants
  // const products = await Product.find({
  //   where: {
  //     id: In(productsIds)
  //   }
  // });

  // Calculate total price based on product variants
  // const totalPrices = variants.reduce((acc, variant) => {
  //   return acc + variant.discountPrice
  // }, 0);

  // const shopsIds = products.map(product => product.shop.shop_id);
  // const shops = await Shop.find({
  //   where: {
  //     shop_id: In(shopsIds)
  //   }
  // })
  // send email to each shop
  // shops.forEach(shop => {
  //   console.log(`Sending email to shop ${shop.email}`);
  // })
  // // send email to user
  // console.log(`Sending email to user ${user.email}`);
  // console.log(
  //   {
  //     ...orderData,
  //     totalPrice: totalPrices,
  //     createdAt: new Date(),
  //     user: user,
  //   }
  // );

  const order = await Order.create({
    ...orderData,
    variants: orderData.variants,
    createdAt: new Date(),
    user: user,
  }).save();
  return order;
}

export { createOrderController }