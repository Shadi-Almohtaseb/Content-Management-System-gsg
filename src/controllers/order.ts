import { In } from "typeorm";
import { Order } from "../db/entities/Order.js";
import { Product } from "../db/entities/Product.js";
import { Shop } from "../db/entities/Shop.js";
import { User } from "../db/entities/User.js";
import { ProductVariant } from "../db/entities/ProductVariants.js";

interface orderDetailsInterface {
  fullName: string;
  phoneNumber: string;
  quantity: number;
  shippingAddress: {
    street: string;
    city: string;
    country: string;
  };
  orderDetails: [
    {
      variant_id: number;
      quantity: number;
    }
  ]
}

const createOrderController = async (orderData: orderDetailsInterface, user: User) => {
  let products: Product[] = [];
  for (let i = 0; i < orderData.orderDetails.length; i++) {
    const product = await Product.findOne({
      where: {
        id: orderData.orderDetails[i].variant_id
      },
      relations: ['shop']
    });
    if (product) {
      products.push(product);
    }
  }

  console.log("products: ", products);
  // unique shops
  const shopsIds = products.map(product => product.shop.shop_id);
  const uniqueShopsIds = [...new Set(shopsIds)];
  console.log("uniqueShopsIds: ", uniqueShopsIds);

  const variants = await ProductVariant.find({
    where: {
      variant_id: In(orderData.orderDetails.map((orderDetail) => orderDetail.variant_id))
    },
    relations: ['product']
  });

  // separate variants for each shop
  const shopVariants = uniqueShopsIds.map((shopId) => {
    return variants.filter((variant) => variant.product.shop && variant.product.shop.shop_id === shopId);
  });

  const totalPrices = shopVariants.map((variants, index) => {
    return variants.reduce((acc, variant) => {
      const orderDetail = orderData.orderDetails.find((orderDetail) => orderDetail.variant_id === variant.variant_id);
      if (orderDetail) {
        return acc + orderDetail.quantity * variant.discountPrice;
      }
      return acc;
    }, 0);
  })


  const shops = await Shop.find({
    where: {
      shop_id: In(uniqueShopsIds)
    }
  });

  let order;
  for (let i = 0; i < shops.length; i++) {
    const shop = shops[i];
    order = await Order.create({
      ...orderData,
      variants: shopVariants[i],
      quantity: shopVariants[i].reduce((acc, variant) => {
        const orderDetail = orderData.orderDetails.find((orderDetail) => orderDetail.variant_id === variant.variant_id);
        if (orderDetail) {
          return acc + orderDetail.quantity;
        }
        return acc;
      }, 0),
      createdAt: new Date(),
      totalPrice: totalPrices[i],
      user: user,
      shop: shop
    }).save();
  }
  return order;
}

export { createOrderController }