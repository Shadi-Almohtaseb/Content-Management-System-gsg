import express from 'express';
import { activateAccountController, loginController, updateUserPasswordController, signupController, forgetUserPasswordController, RestUserPasswordController } from '../controllers/user.js';
import { authenticate } from '../middleware/auth.js';
import { ExpressNS } from '../../@types/index.js';
const router = express.Router();

/* POST Signup user. */
router.post("/signup", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    if (req.body.userName && req.body.password && req.body.email) {
      const data = await signupController(req.body);
      return res.status(201).json(data)
    } else {
      return res.status(400).json("All fields are required");
    }
  } catch (error) {
    next(error);
  }
})

/*POST activate user account (create in db) */
router.post("/activation", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { email, otp } = req.body;

    const data = await activateAccountController(email, otp);
    return res.status(201).cookie(
      "userToken", data.token,
      { httpOnly: true, secure: true, sameSite: "none" }).json(data
      );

  } catch (error) {
    next(error)
  }
})

/* POST Login user. */
router.post("/login", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    if (req.body.email && req.body.password) {
      const data = await loginController(req.body);
      return res.status(200).cookie(
        "userToken", data.token,
        { httpOnly: true, secure: true, sameSite: "none" }).json(data)
    } else {
      return res.status(400).json("All fields are required");
    }
  } catch (error) {
    next(error);
  }
})

/*POST Logout User */
router.post("/logout", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    return res.status(200).clearCookie("userToken").json({ success: true, message: "User logged out successfully" })
  } catch (error) {
    next(error)
  }
})

/* POST Forget user password */
router.post("/forget-password", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) res.status(400).json({ success: false, message: "Email is required" })
    const data = await forgetUserPasswordController(email);
    return res.status(200).json({ success: true, message: "Verification Code sent successfully", verificationCode: data.code })
  } catch (error) {
    next(error)
  }
})

/* PUT Reset User Password */
router.put("/reset-password", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { email, verificationCode, newPassword } = req.body;
    if (!email || !verificationCode || !newPassword) res.status(400).json({ success: false, message: "All fields are required" })
    await RestUserPasswordController(email, verificationCode, newPassword);
    return res.status(200).json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    next(error)
  }
})

/* PUT Reset User Password */
router.put("/password", authenticate, async (req: ExpressNS.RequestWithUser, res: express.Response, next: express.NextFunction) => {
  try {
    const user = req.user;
    if (!user) res.status(401).json({ success: false, message: "You are unauthorized, login to continue" })

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) res.status(400).json({ success: false, message: "All fields are required" })
    await updateUserPasswordController(user, oldPassword, newPassword);
    return res.status(200).json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    next(error)
  }
})

export default router;
