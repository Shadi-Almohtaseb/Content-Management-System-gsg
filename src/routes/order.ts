import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import { ExpressNS } from '../../@types/index.js';
import { AppError } from '../utils/errorHandler.js';
import { createOrderController, getOrdersController } from '../controllers/order.js';
const router = express.Router();

/* POST create Order */
router.post("/", authenticateUser, async (req: ExpressNS.RequestWithUser, res: express.Response, next: express.NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      throw new AppError("you are unauthorized, login to continue", 404, true);
    }
    if (!req.body.orderDetails || !req.body.orderDetails.length) {
      throw new AppError("No items in the cart", 400, true);
    }
    if (!req.body.shippingAddress || !req.body.shippingAddress.street || !req.body.shippingAddress.city || !req.body.shippingAddress.country) {
      throw new AppError("shipping address is required", 400, true);
    }
    if (!req.body.phoneNumber || !req.body.fullName) {
      throw new AppError("Some fields are missing", 400, true);
    }

    const order = await createOrderController(req.body, user);

    res.status(201).json({
      status: "success",
      message: "Order created successfully",
      order: order,
    });
  } catch (error) {
    next(error);
  }
});

// get all orders
router.get("/", authenticateUser, async (req: ExpressNS.RequestWithUser, res: express.Response, next: express.NextFunction) => {

  try {
    const user = req.user;

    if (!user) {
      throw new AppError("you are unauthorized, login to continue", 404, true);
    }

    const orders = await getOrdersController(user);

    res.status(200).json({
      status: "success",
      orders: orders,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/test", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    res.status(200).json({ message: "test route" });
  } catch (error) {
    next(error);
  }
})

export default router;