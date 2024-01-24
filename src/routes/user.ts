import express from 'express';
import { activateAccountController, loginController, updateUserPasswordController, signupController, forgetUserPasswordController, RestUserPasswordController, getUserController, updateUserProfileController } from '../controllers/user.js';
import { authenticateUser } from '../middleware/auth.js';
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
      "_auth", data.token,
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
        "_auth", data.token,
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
    return res.status(200).clearCookie("_auth").json({ success: true, message: "User logged out successfully" })
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
router.put("/password", authenticateUser, async (req: ExpressNS.RequestWithUser, res: express.Response, next: express.NextFunction) => {
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

/* GET get user */
router.get("/:id", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { id } = req.params;
    const data = await getUserController(id);
    return res.status(200).json(data)
  } catch (error) {
    next(error)
  }
})

/* PUT update user profile */
router.put("/", authenticateUser, async (req: ExpressNS.RequestWithUser, res: express.Response, next: express.NextFunction) => {
  try {
    const user = req.user;
    if (!user) res.status(401).json({ success: false, message: "You are unauthorized, login to continue" })
    const data = await updateUserProfileController(user, req.body);
    return res.status(200).json(data)
  } catch (error) {
    next(error)
  }
})

/* DELETE delete user */
router.delete("/", authenticateUser, async (req: ExpressNS.RequestWithUser, res: express.Response, next: express.NextFunction) => {
  try {
    const user = req.user;
    if (!user) res.status(401).json({ success: false, message: "You are unauthorized, login to continue" })
    user.isDeleted = true;
    await user.save();
    return res.status(200).clearCookie("_auth").json({ success: true, message: "User deleted successfully" })
  } catch (error) {
    next(error)
  }
})

export default router;
