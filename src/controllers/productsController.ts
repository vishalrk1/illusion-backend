import Product from "../models/Product";
import { Request, Response } from "express";

// get all producte
export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { isFeatured } = req.query;
  try {
    let query: any = {};
    if (isFeatured === "true") {
      query.isFeatured = true;
    }
    const products = await Product.find(query).populate("category");
    res
      .status(200)
      .json({ message: "Products fetched sucessfully", data: products });
  } catch (error) {
    res
      .status(400)
      .json({
        message: "Cant get Products, Something went wrong",
        error: (error as Error).message,
      });
  }
};

// get products with category
export const getProductsByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { isFeatured } = req.query;
  try {
    let query: any = { category: id };
    if (isFeatured === "true") {
      query.isFeatured = true;
    }
    const products = await Product.find(query);
    res
      .status(200)
      .json({ message: "Products fetched sucessfully", data: products });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Cant get Products, Something went wrong" });
  }
};

// get product by Id
export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    res
      .status(200)
      .json({ message: "Product fetched sucessfully", data: product });
  } catch (error) {
    res.status(400).json({ message: "Cant get Product, Something went wrong" });
  }
};

// add new product
export const addProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const product = new Product(req.body);
    console.log(product);
    await product.save();
    res
      .status(200)
      .json({ message: "Product Added sucessfully", data: product });
  } catch (error) {
    res.status(400).json({
      message: "Cant add Product, Something went wrong",
      error: (error as Error).message,
    });
  }
};

// update Product
export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  console.log(id);
  try {
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
    }

    res
      .status(200)
      .json({ message: "Product Updated sucessfully", data: product });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Cant update Product, Something went wrong" });
  }
};

// delete product
export const removeProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      res.status(404).json({ message: "Product not found" });
    }

    res
      .status(200)
      .json({ message: "Product removed sucessfully", data: product });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Cant remove Product, Something went wrong" });
  }
};
