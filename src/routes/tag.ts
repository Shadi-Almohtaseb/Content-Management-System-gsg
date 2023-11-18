import express from 'express';
import { createTagController, getAllTagsController, getTagController, updateTagController } from '../controllers/tag.js';
import { AppError } from '../utils/errorHandler.js';
const router = express.Router();

/* POST create Tag. */
router.post("/", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    if (!req.body.name) {
      throw new AppError("Some fields are missing", 400, true);
    }
    const tag = await createTagController(req.body);
    res.status(201).json({ success: true, message: "Tag created successfully", tag });
  } catch (error) {
    next(error);
  }
});


/* GET get all Tags */
router.get("/", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const tags = await getAllTagsController();
    res.status(200).json(tags);
  } catch (error) {
    next(error);
  }
})

/* GET Tag by id */
router.get("/:id", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const tag = await getTagController(Number(req.params.id));
    res.status(200).json({ success: true, message: "Tags retrieved successfully", tag });
  } catch (error) {
    next(error);
  }
})

/* DELETE Tag */
router.delete("/:id", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const TagId = Number(req.params.id);

    // Retrieve Tag to get the image URL
    const Tag = await getTagController(TagId);

    if (!Tag) {
      throw new AppError("Tag not found", 404, true);
    }

    // Delete Tag from the database
    await Tag.remove();

    res.status(200).json({ success: true, message: "Tag deleted successfully" });
  } catch (error) {
    next(error);
  }
});

/* PUT update Tag */
router.put("/:id", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const tag = await updateTagController(Number(req.params.id), req.body);
    res.status(200).json({ success: true, message: "Tags retrieved successfully", tag });
  } catch (error) {
    next(error);
  }
})


export default router;