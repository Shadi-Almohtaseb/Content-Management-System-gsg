import { Category } from "../db/entities/Category.js"
import { AppError } from "../utils/errorHandler.js";

const createCategoryController = async (payload: Category, file: string) => {
    const category = await Category.findOne({ where: { name: payload.name } })
    if (category) {
        throw new AppError("Category already exists", 409, true);
    }

    const newCategory = Category.create({
        ...payload,
        image: file
    });

    return newCategory.save();
}

const getAllCategoriesController = async () => {
    const categories = await Category.findAndCount();
    return {
        total: categories[1],
        categories: categories[0]
    }
}

const getCategoryController = async (id: number) => {
    const category = await Category.findOne({ where: { id } })
    if (!category) {
        throw new AppError("Category not found", 404, true);
    }
    return category;
}

// const deleteCategoryController = async (id: number) => {
//     const category = await Category.findOne({ where: { id } })
//     if (!category) {
//         throw new AppError("Category not found");
//     }
//     return category.remove();
// }

const updateCategoryController = async (id: number, payload: Category) => {
    const category = await Category.findOne({ where: { id } })
    if (!category) {
        throw new AppError("Category not found", 404, true);
    }
    category.name = payload.name || category.name;
    category.image = payload.image || category.image;
    category.description = payload.description || category.description;
    return category.save();
}

export { createCategoryController, getAllCategoriesController, updateCategoryController, getCategoryController }