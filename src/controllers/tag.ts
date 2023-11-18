import { Tag } from "../db/entities/Tag.js";
import { AppError } from "../utils/errorHandler.js";

const createTagController = async (payload: Tag) => {
    const tag = await Tag.findOne({ where: { name: payload.name } })
    if (tag) {
        throw new AppError("Tag already exists", 409, true);
    }

    const newTag = Tag.create(payload);

    return newTag.save();
}

const getAllTagsController = async () => {
    const tags = await Tag.findAndCount();
    return {
        total: tags[1],
        tags: tags[0]
    }
}

const getTagController = async (id: number) => {
    const tag = await Tag.findOne({ where: { id } })
    if (!tag) {
        throw new AppError("Tag not found", 404, true);
    }
    return tag;
}

const updateTagController = async (id: number, payload: Tag) => {
    const tag = await Tag.findOne({ where: { id } })
    if (!tag) {
        throw new AppError("Tag not found", 404, true);
    }
    tag.name = payload.name || tag.name;
    return tag.save();
}

export { createTagController, getAllTagsController, updateTagController, getTagController }