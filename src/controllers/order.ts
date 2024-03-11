import { EntityManager, In } from "typeorm";
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
    const { fullName, phoneNumber, shippingAddress, orderDetails } = orderData;

    if (!fullName || !phoneNumber || !shippingAddress || !orderDetails.length) {
      throw new AppError("Incomplete order data", 400, true);
    }

    const userIn = await User.findOneOrFail({ where: { id: user.id }, relations: ['address'] });

    const productIds = orderDetails.map((detail) => detail.variant_id);
    const variants = await ProductVariant.find({
      where: { variant_id: In(productIds) },
      relations: ['product', 'product.shop']
    });

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
      ...shippingAddress,
      createdAt: new Date(),
      user: userIn,
      orders: []
    });

    await userAddress.save();

    const orders: Promise<Order>[] = [];
    for (const [shopId, variantsForShop] of shopVariantsMap.entries()) {
      const shop = await Shop.findOne({ where: { shop_id: shopId }, select: ['shop_id'] });

      if (!shop) {
        console.log(`Shop with ID ${shopId} not found. Skipping order creation.`);
        continue;
      }

      const totalPrice = variantsForShop.reduce((acc, variant) => {
        const orderDetail = orderDetails.find((detail) => detail.variant_id === variant.variant_id);
        return acc + (orderDetail ? orderDetail.quantity * variant.discountPrice : 0);
      }, 0);

      const quantity = variantsForShop.reduce((acc, variant) => {
        const orderDetail = orderDetails.find((detail) => detail.variant_id === variant.variant_id);
        return acc + (orderDetail ? orderDetail.quantity : 0);
      }, 0);

      const order = Order.create({
        user: userIn,
        shop: shop,
        variants: variantsForShop,
        quantity: quantity,
        totalPrice: totalPrice,
        fullName: fullName,
        phoneNumber: phoneNumber,
        createdAt: new Date(),
        status: 'pending',
        shippingAddress: userAddress
      });

      orders.push(dataSource.manager.save(order));

      // Add the order to the userAddress's orders array
      userAddress?.orders.push(order);
    }

    // Save the updated userAddress with associated orders
    await userAddress.save();

    return Promise.all(orders);
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

export { createOrderController };
