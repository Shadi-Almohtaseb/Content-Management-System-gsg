import express from 'express';
import { RestShopPasswordController, activateAccountController, forgetShopPasswordController, getShopController, loginShopController, signupShopController, updateShopController, updateShopPasswordController } from '../controllers/shop.js';
import { ExpressNS } from '../../@types/index.js';
import { authenticateShop } from '../middleware/auth.js';
const router = express.Router();

/* POST Signup Shop. */
router.post("/signup", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    if (req.body.shopName && req.body.password && req.body.email && req.body.phoneNumber) {
      const data = await signupShopController(req.body);
      return res.status(201).json(data)
    } else {
      return res.status(400).json("All fields are required");
    }
  } catch (error) {
    next(error);
  }
})

/*POST activate shop account (create in db) */
router.post("/activation", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { email, otp } = req.body;

    const data = await activateAccountController(email, otp);
    return res.status(201).cookie(
      "_auth", data.token,
      { httpOnly: true, secure: true, sameSite: "none" }).json(data
      );

  } catch (error) {
    next(error)
  }
})

/* POST Login shop. */
router.post("/login", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    if (req.body.email && req.body.password) {
      const data = await loginShopController(req.body);
      return res.status(200).cookie(
        "_auth", data.token,
        { httpOnly: true, secure: true, sameSite: "none" }).json(data)
    } else {
      return res.status(400).json("All fields are required");
    }
  } catch (error) {
    next(error);
  }
})

/*POST Logout Shop */
router.post("/logout", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    return res.status(200).clearCookie("_auth").json({ success: true, message: "Shop logged out successfully" })
  } catch (error) {
    next(error)
  }
})

/* POST Forget shop password */
router.post("/forget-password", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) res.status(400).json({ success: false, message: "Email is required" })
    const data = await forgetShopPasswordController(email);
    return res.status(200).json({ success: true, message: "Verification Code sent successfully", verificationCode: data.code })
  } catch (error) {
    next(error)
  }
})

/* PUT Reset Shop Password */
router.put("/reset-password", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { email, verificationCode, newPassword } = req.body;
    if (!email || !verificationCode || !newPassword) res.status(400).json({ success: false, message: "All fields are required" })
    await RestShopPasswordController(email, verificationCode, newPassword);
    return res.status(200).json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    next(error)
  }
})

/* PUT Reset User Password */
router.put("/password", authenticateShop, async (req: ExpressNS.RequestWithShop, res: express.Response, next: express.NextFunction) => {
  try {
    const shop = req.shop;
    if (!shop) res.status(401).json({ success: false, message: "You are unauthorized, login to continue" })

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) res.status(400).json({ success: false, message: "All fields are required" })
    await updateShopPasswordController(shop, oldPassword, newPassword);
    return res.status(200).json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    next(error)
  }
})

/* GET get shop */
router.get("/:id", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { id } = req.params;
    const data = await getShopController(id);
    return res.status(200).json(data)
  } catch (error) {
    next(error)
  }
})

/* PUT update shop profile */
router.put("/", authenticateShop, async (req: ExpressNS.RequestWithShop, res: express.Response, next: express.NextFunction) => {
  try {
    const shop = req.shop;
    if (!shop) res.status(401).json({ success: false, message: "You are unauthorized, login to continue" })
    const data = await updateShopController(shop, req.body);
    return res.status(200).json(data)
  } catch (error) {
    next(error)
  }
})

/* DELETE delete shop */
router.delete("/", authenticateShop, async (req: ExpressNS.RequestWithShop, res: express.Response, next: express.NextFunction) => {
  try {
    const shop = req.shop;
    if (!shop) res.status(401).json({ success: false, message: "You are unauthorized, login to continue" })
    shop.isDeleted = true;
    await shop.save();
    return res.status(200).json({ success: true, message: "Shop deleted successfully" })
  } catch (error) {
    next(error)
  }
})

export default router;