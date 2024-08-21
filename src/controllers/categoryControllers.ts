import Category, { ICategory } from "../models/Category";
import { Request, Response } from "express";

// create one category
export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const category: ICategory = new Category(req.body);
    await category.save();
    res
      .status(201)
      .json({ message: "Category Created Sucessfully", data: category });
  } catch (error) {
    res.status(400).json({
      message: "Category not created!",
      error: (error as Error).message,
    });
  }
};

// all categories
export const getCateories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await Category.find();
    res
      .status(200)
      .json({ message: "Categories fetched sucessfully", data: categories });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Cant get categories, Something went wrong" });
  }
};

// Finding category by Id
export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const category = await Category.findById(id);
    res
      .status(200)
      .json({ message: "Category Details found sucessfully", data: category });
  } catch (error) {
    res.status(400).json({
      message: "Can't get category, something went wrong",
      error: (error as Error).message,
    });
  }
};

// updating category
export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const category = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!category) {
      res.json(404).json({
        message: "Category Not Found!!",
      });
    }

    res
      .status(200)
      .json({ message: "Category Updated found sucessfully", data: category });
  } catch (error) {
    res.json(400).json({
      message: "Can't update category, something went wrong",
      error: (error as Error).message,
    });
  }
};

// delete category
export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      res.json(404).json({
        message: "Category Not Found!!",
      });
    }

    res.status(200).json({ message: "Category removed sucessfully" });
  } catch (error) {
    res.json(400).json({
      message: "Can't delete category, something went wrong",
      error: (error as Error).message,
    });
  }
};
