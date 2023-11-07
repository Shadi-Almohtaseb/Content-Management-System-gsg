import express from 'express';
import { activateAccountController, signupController } from '../controllers/user.js';
const router = express.Router();

/* POST Signup user. */
router.post("/signup", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    if (req.body.userName && req.body.password && req.body.email) {
      const data = await signupController(req.body);
      return res.status(201).cookie("otp", data.userOTP, { httpOnly: true }).json(data)
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
    const { userId, otp } = req.body;

    const data = await activateAccountController(userId, otp);
    return res.status(201).cookie(
      "userToken", data.token,
      { httpOnly: true, secure: true, sameSite: "none" }).json(data
      );

  } catch (error) {
    next(error)
  }
})

/* GET users listing */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});


export default router;
