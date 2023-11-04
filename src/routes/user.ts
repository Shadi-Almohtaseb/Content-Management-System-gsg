import express from 'express';
import { signupController } from '../controllers/user.js';
const router = express.Router();


/* POST Signup user. */
router.post("/signup", async (req: express.Request, res: express.Response) => {
  try {
    if (req.body.userName && req.body.password && req.body.email) {
      const token = await signupController(req.body);
      return res.status(201).json({ token });
    } else {
      return res.status(400).json("All fields are required");
    }
  } catch (error) {
    console.error(error);
    if (error === "user already exists") {
      return res.status(409).json("User already exists");
    }
    return res.status(500).json("Internal server error");
  }
});

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

export default router;
