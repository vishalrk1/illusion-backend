import Wishlist from "../models/Wishlist";
import Product, { IProduct } from "../models/Product";
import { Request, Response } from "express";
import mongoose from "mongoose";

// get all producte
export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;
  const { isFeatured } = req.query;
  try {
    let query: any = {};
    if (isFeatured === "true") {
      query.isFeatured = true;
    }

    const products =
      isFeatured === "true"
        ? await Product.find(query).populate("category").lean()
        : await Product.find(query).lean();

    // if logged in
    if (userId) {
      const wishlist = await Wishlist.findOne({ user: userId });
      const productsWithWishlistInfo = products.map((product: any) => ({
        ...product,
        isWishlisted: wishlist
          ? wishlist.products.some(
              (wishlistProductId: mongoose.Types.ObjectId) =>
                wishlistProductId.equals(product._id)
            )
          : false,
      }));
      res.status(200).json({
        message: "Products fetched successfully",
        data: productsWithWishlistInfo,
      });
    } else {
      // If user not logged in
      const productsWithWishlistInfo = products.map((product: any) => ({
        ...product,
        isWishlisted: false,
      }));
      res.status(200).json({
        message: "Products fetched successfully",
        data: productsWithWishlistInfo,
      });
    }
  } catch (error) {
    res.status(400).json({
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
  const userId = req?.user?.id;
  const { id } = req.params;
  const { isFeatured } = req.query;
  try {
    let query: any = { category: id };
    if (isFeatured === "true") {
      query.isFeatured = true;
    }
    const products =
      isFeatured === "true"
        ? await Product.find(query).populate("category").lean()
        : await Product.find(query).lean();

    // if logged in
    if (userId) {
      const wishlist = await Wishlist.findOne({ user: userId });
      const productsWithWishlistInfo = products.map((product: any) => ({
        ...product,
        isWishlisted: wishlist
          ? wishlist.products.some(
              (wishlistProductId: mongoose.Types.ObjectId) =>
                wishlistProductId.equals(product._id)
            )
          : false,
      }));
      res.status(200).json({
        message: "Products fetched successfully",
        data: productsWithWishlistInfo,
      });
    } else {
      // If user not logged in
      const productsWithWishlistInfo = products.map((product: any) => ({
        ...product,
        isWishlisted: false,
      }));
      res.status(200).json({
        message: "Products fetched successfully",
        data: productsWithWishlistInfo,
      });
    }
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

export const getFeaturedProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const products = await Product.find({ isFeatured: true })
      .populate("category")
      .lean();
    res.status(200).json({
      message: "Featured Products fetched successfully",
      data: products,
    });
  } catch (error) {
    res.status(400).json({
      message: "Cant get Products, Something went wrong",
      error: (error as Error).message,
    });
  }
};
