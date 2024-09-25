import { Request, Response } from "express";
import Wishlist from "../models/Wishlist";
import Product from "../models/Product";

export const getWishlist = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;
  try {
    const wishlist = await Wishlist.findOne({ user: userId }).populate(
      "products"
    );
    if (!wishlist) {
      res.status(404).json({
        message: "Can't get wishlist, something went wrong",
        error: "Wishlist not found",
      });
      return;
    }
    res
      .status(200)
      .json({ message: "Wishlist fetched sucessfully", data: wishlist });
  } catch (error) {
    res.status(400).json({
      message: "Can't get wishlist, something went wrong",
      error: (error as Error).message,
    });
  }
};

export const addToWishlist = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({
        message: "Can't Add to wishlist, something went wrong",
        error: "Product not found",
      });
      return;
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $addToSet: { products: productId } },
      { upsert: true, new: true }
    ).populate("products");
    res
      .status(200)
      .json({ message: "Product added to wishlist", data: wishlist });
  } catch (error) {
    res.status(400).json({
      message: "Can't add product to wishlist, something went wrong",
      error: (error as Error).message,
    });
  }
};

export const removeFromWishlist = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;
  const { productId } = req.params;

  try {
    const wishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $pull: { products: productId } },
      { new: true }
    ).populate("products");
    res
      .status(200)
      .json({ message: "Product removed from wishlist", data: wishlist });
  } catch (error) {
    res.status(400).json({
      message: "Can't remove product from wishlist, something went wrong",
      error: (error as Error).message,
    });
  }
};
