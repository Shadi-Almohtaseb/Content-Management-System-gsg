import { In, EntityManager } from "typeorm";
import { Order } from "../db/entities/Order.js";
import { Shop } from "../db/entities/Shop.js";
import { User } from "../db/entities/User.js";
import { ProductVariant } from "../db/entities/ProductVariants.js";
import { Address } from "../db/entities/Address.js";
import dataSource from "../db/dataSource.js";
import { AppError } from "../utils/errorHandler.js";

interface OrderDetail {
  variant_id: number;
  quantity: number;
}

const createOrderController = async (orderData: {
  fullName: string;
  phoneNumber: string;
  shippingAddress: {
    street: string;
    city: string;
    country: string;
    region: string;
  };
  orderDetails: OrderDetail[];
}, user: User): Promise<Order[]> => {
  try {
    return dataSource.manager.transaction(async (transactionManager: EntityManager) => {
      const userIn = await User.findOne({ where: { id: user.id }, relations: ['address'] });
      if (!userIn) {
        throw new AppError("User not found", 404, true);
      }
      const productIds = orderData.orderDetails.map((detail) => detail.variant_id);
      const variants = await ProductVariant.find({
        where: {
          variant_id: In(productIds)
        },
        relations: ['product', 'product.shop']
      });

      // Create a map of shop IDs to variants
      const shopVariantsMap = new Map<string, ProductVariant[]>();
      variants.forEach((variant) => {
        const shopId = variant.product.shop?.shop_id;
        if (shopId) {
          const variantsForShop = shopVariantsMap.get(shopId) || [];
          variantsForShop.push(variant);
          shopVariantsMap.set(shopId, variantsForShop);
        }
      });

      const userAddress = Address.create({
        country: orderData.shippingAddress.country,
        city: orderData.shippingAddress.city,
        street: orderData.shippingAddress.street,
        region: orderData.shippingAddress.region,
        createdAt: new Date(),
        user: userIn,
      });

      await transactionManager.save(userAddress);

      // Create orders for each shop
      const orders: Order[] = [];
      for (const [shopId, variantsForShop] of shopVariantsMap.entries()) {
        console.log(`Processing shop with ID: ${shopId}`);
        console.log(`Variants for shop:`, variantsForShop);

        const shop = await Shop.findOne({ where: { shop_id: shopId }, select: ['shop_id'] });
        if (shop) {
          const totalPrice = variantsForShop.reduce((acc, variant) => {
            const orderDetail = orderData.orderDetails.find((detail) => detail.variant_id === variant.variant_id);
            if (orderDetail) {
              return acc + orderDetail.quantity * variant.discountPrice;
            }
            return acc;
          }, 0);

          console.log(`Total price for shop with ID ${shopId}:`, totalPrice);


          const quantity = variantsForShop.reduce((acc, variant) => {
            const orderDetail = orderData.orderDetails.find((detail) => detail.variant_id === variant.variant_id);
            if (orderDetail) {
              return acc + orderDetail.quantity;
            }
            return acc;
          }, 0);

          console.log(`Total quantity for shop with ID ${shopId}:`, quantity);


          if (variantsForShop.length === 0) {
            console.log(`Variants for shop with ID ${shopId} is empty. Skipping order creation.`);
            continue; // Skip creating order if variants are empty
          }

          console.log(`Creating order for shop with ID ${shopId}`);

          const order = Order.create({
            user: userIn,
            shop: shop,
            variants: variantsForShop,
            quantity: quantity,
            totalPrice: totalPrice,
            fullName: orderData.fullName,
            phoneNumber: orderData.phoneNumber,
            createdAt: new Date(),
            status: 'pending',
            shippingAddress: userIn?.address
          });

          await transactionManager.save(order);
          orders.push(order);
        } else {
          console.log(`Shop with ID ${shopId} not found. Skipping order creation.`);
        }
      }

      return orders;
    });
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

export { createOrderController };
