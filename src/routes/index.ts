import express from "express";
const router = express.Router();

/* GET home page. */
router.get("/", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    res.send("index");
  } catch (error) {
    next(error);
  }
});

export default router;
